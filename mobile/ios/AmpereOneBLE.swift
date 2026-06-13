//
//  AmpereOneBLE.swift
//  Ampere One — standalone CoreBluetooth client
//
//  Drop-in BLE manager that connects to an ESP32 advertising as "Ampere One",
//  subscribes to its telemetry notify characteristic, and decodes the JSON
//  payload into @Published properties for SwiftUI.
//
//  BLE contract:
//    Service UUID : a1b20001-5c6d-4e7f-8a9b-0c1d2e3f4a5b
//    Notify char  : a1b20002-5c6d-4e7f-8a9b-0c1d2e3f4a5b
//    Advert name  : "Ampere One"
//    Payload (~1s): {"w":1234,"tank":80,"lpm":0.00,"leak":false}
//      w    = watts (Double)
//      tank = tank percent 0-100 (Int; -1 means no echo / unknown)
//      lpm  = water flow litres/min (Double)
//      leak = leak detected (Bool)
//
//  No external dependencies. Requires NSBluetoothAlwaysUsageDescription in Info.plist.
//

import Foundation
import CoreBluetooth
import Combine

// MARK: - Connection state

public enum AmpereOneConnectionState: Equatable {
    case poweredOff
    case unauthorized
    case unsupported
    case idle           // powered on, not scanning, not connected
    case scanning
    case connecting
    case connected
    case reconnecting
}

// MARK: - Decoded telemetry frame

private struct AmpereOneFrame: Decodable {
    let w: Double
    let tank: Double
    let lpm: Double
    let leak: Bool

    enum CodingKeys: String, CodingKey { case w, tank, lpm, leak }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        // Tolerate ints, doubles, or numeric strings for the numeric fields.
        w    = try AmpereOneFrame.number(c, .w)    ?? 0
        tank = try AmpereOneFrame.number(c, .tank) ?? -1
        lpm  = try AmpereOneFrame.number(c, .lpm)  ?? 0
        leak = (try? c.decode(Bool.self, forKey: .leak)) ?? false
    }

    private static func number(_ c: KeyedDecodingContainer<CodingKeys>,
                               _ key: CodingKeys) throws -> Double? {
        if let d = try? c.decode(Double.self, forKey: key) { return d }
        if let i = try? c.decode(Int.self, forKey: key) { return Double(i) }
        if let s = try? c.decode(String.self, forKey: key) { return Double(s) }
        return nil
    }
}

// MARK: - Manager

public final class AmpereOneBLE: NSObject, ObservableObject {

    // UUIDs from the firmware contract.
    public static let serviceUUID = CBUUID(string: "a1b20001-5c6d-4e7f-8a9b-0c1d2e3f4a5b")
    public static let notifyUUID  = CBUUID(string: "a1b20002-5c6d-4e7f-8a9b-0c1d2e3f4a5b")
    public static let deviceName  = "Ampere One"

    // MARK: Published telemetry

    @Published public private(set) var watts: Double = 0          // w
    @Published public private(set) var tankPct: Int = -1          // tank (-1 = unknown)
    @Published public private(set) var flowLpm: Double = 0        // lpm
    @Published public private(set) var leak: Bool = false         // leak
    @Published public private(set) var isConnected: Bool = false
    @Published public private(set) var state: AmpereOneConnectionState = .idle
    @Published public private(set) var lastError: String?
    @Published public private(set) var lastUpdate: Date?

    /// True when the manager should keep the link up (auto-reconnect on drop).
    private var shouldStayConnected = false

    private var central: CBCentralManager!
    private var peripheral: CBPeripheral?
    private var notifyChar: CBCharacteristic?

    // Reassembles potentially-fragmented UTF-8/JSON across BLE notifications.
    private var rxBuffer = Data()

    private var reconnectWorkItem: DispatchWorkItem?
    private let reconnectDelay: TimeInterval = 2.0
    private let bleQueue = DispatchQueue(label: "com.quantyx.ampereone.ble")

    public override init() {
        super.init()
        central = CBCentralManager(delegate: self, queue: bleQueue)
    }

    deinit {
        reconnectWorkItem?.cancel()
        if let p = peripheral { central.cancelPeripheralConnection(p) }
    }

    // MARK: - Public API

    /// Begin scanning for "Ampere One" and connect to the first match.
    public func connect() {
        shouldStayConnected = true
        lastError = nil
        startScanIfReady()
    }

    /// Graceful disconnect; cancels reconnection.
    public func disconnect() {
        shouldStayConnected = false
        reconnectWorkItem?.cancel()
        reconnectWorkItem = nil
        if central.isScanning { central.stopScan() }
        if let p = peripheral {
            central.cancelPeripheralConnection(p)
        } else {
            setState(.idle)
        }
    }

    // MARK: - Internal helpers

    private func startScanIfReady() {
        guard central.state == .poweredOn else {
            // Will be retried from centralManagerDidUpdateState once powered on.
            return
        }
        guard peripheral == nil else { return } // already connecting/connected
        rxBuffer.removeAll(keepingCapacity: true)
        setState(.scanning)
        central.scanForPeripherals(
            withServices: [Self.serviceUUID],
            options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
        )
    }

    private func scheduleReconnect() {
        guard shouldStayConnected else { return }
        reconnectWorkItem?.cancel()
        let work = DispatchWorkItem { [weak self] in
            guard let self, self.shouldStayConnected else { return }
            self.setState(.reconnecting)
            self.startScanIfReady()
        }
        reconnectWorkItem = work
        bleQueue.asyncAfter(deadline: .now() + reconnectDelay, execute: work)
    }

    private func setState(_ s: AmpereOneConnectionState) {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.state = s
            self.isConnected = (s == .connected)
            if s != .connected {
                // Don't zero telemetry; surface the staleness via lastUpdate instead.
            }
        }
    }

    private func setError(_ msg: String?) {
        DispatchQueue.main.async { [weak self] in self?.lastError = msg }
    }

    /// Decode one or more JSON frames out of the rolling RX buffer.
    private func ingest(_ data: Data) {
        rxBuffer.append(data)

        // Cap runaway buffer (malformed stream guard).
        if rxBuffer.count > 4096 {
            rxBuffer.removeAll(keepingCapacity: true)
            setError("RX buffer overflow — resetting")
            return
        }

        // Fast path: each notification is usually one complete JSON object.
        if let frame = Self.decodeFrame(rxBuffer) {
            apply(frame)
            rxBuffer.removeAll(keepingCapacity: true)
            return
        }

        // Slow path: concatenated objects "}{". Split on balanced braces.
        extractBalancedObjects()
    }

    private func extractBalancedObjects() {
        var depth = 0
        var start: Int? = nil
        var consumedUpTo = 0
        let bytes = [UInt8](rxBuffer)

        for (i, b) in bytes.enumerated() {
            if b == UInt8(ascii: "{") {
                if depth == 0 { start = i }
                depth += 1
            } else if b == UInt8(ascii: "}") {
                depth -= 1
                if depth == 0, let s = start {
                    let slice = Data(bytes[s...i])
                    if let frame = Self.decodeFrame(slice) {
                        apply(frame)
                        consumedUpTo = i + 1
                    }
                    start = nil
                }
            }
        }
        if consumedUpTo > 0 {
            rxBuffer.removeFirst(consumedUpTo)
        }
    }

    private static func decodeFrame(_ data: Data) -> AmpereOneFrame? {
        guard !data.isEmpty else { return nil }
        return try? JSONDecoder().decode(AmpereOneFrame.self, from: data)
    }

    private func apply(_ frame: AmpereOneFrame) {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.watts = frame.w
            self.tankPct = Int(frame.tank.rounded())
            self.flowLpm = frame.lpm
            self.leak = frame.leak
            self.lastUpdate = Date()
            self.lastError = nil
        }
    }
}

// MARK: - CBCentralManagerDelegate

extension AmpereOneBLE: CBCentralManagerDelegate {

    public func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            if shouldStayConnected { startScanIfReady() }
            else { setState(.idle) }
        case .poweredOff:
            setState(.poweredOff)
            setError("Bluetooth is powered off")
            peripheral = nil
            notifyChar = nil
        case .unauthorized:
            setState(.unauthorized)
            setError("Bluetooth permission denied")
        case .unsupported:
            setState(.unsupported)
            setError("Bluetooth LE not supported on this device")
        case .resetting, .unknown:
            setState(.idle)
        @unknown default:
            setState(.idle)
        }
    }

    public func centralManager(_ central: CBCentralManager,
                               didDiscover peripheral: CBPeripheral,
                               advertisementData: [String: Any],
                               rssi RSSI: NSNumber) {
        // Match on advertised name as a secondary guard (service UUID already filtered).
        let advName = (advertisementData[CBAdvertisementDataLocalNameKey] as? String)
            ?? peripheral.name
        if let name = advName, name != Self.deviceName {
            // Service UUID matched but name differs — still acceptable, but prefer exact name.
            // Continue: a service-filtered match is authoritative.
        }

        central.stopScan()
        self.peripheral = peripheral
        peripheral.delegate = self
        setState(.connecting)
        central.connect(peripheral, options: nil)
    }

    public func centralManager(_ central: CBCentralManager,
                               didConnect peripheral: CBPeripheral) {
        setError(nil)
        peripheral.discoverServices([Self.serviceUUID])
    }

    public func centralManager(_ central: CBCentralManager,
                               didFailToConnect peripheral: CBPeripheral,
                               error: Error?) {
        setError("Connect failed: \(error?.localizedDescription ?? "unknown")")
        self.peripheral = nil
        self.notifyChar = nil
        scheduleReconnect()
    }

    public func centralManager(_ central: CBCentralManager,
                               didDisconnectPeripheral peripheral: CBPeripheral,
                               error: Error?) {
        self.notifyChar = nil
        self.peripheral = nil
        rxBuffer.removeAll(keepingCapacity: true)
        if let error = error {
            setError("Disconnected: \(error.localizedDescription)")
        }
        if shouldStayConnected {
            scheduleReconnect()
        } else {
            setState(.idle)
        }
    }
}

// MARK: - CBPeripheralDelegate

extension AmpereOneBLE: CBPeripheralDelegate {

    public func peripheral(_ peripheral: CBPeripheral,
                           didDiscoverServices error: Error?) {
        if let error = error {
            setError("Service discovery failed: \(error.localizedDescription)")
            central.cancelPeripheralConnection(peripheral)
            return
        }
        guard let service = peripheral.services?.first(where: { $0.uuid == Self.serviceUUID }) else {
            setError("Ampere One service not found")
            central.cancelPeripheralConnection(peripheral)
            return
        }
        peripheral.discoverCharacteristics([Self.notifyUUID], for: service)
    }

    public func peripheral(_ peripheral: CBPeripheral,
                           didDiscoverCharacteristicsFor service: CBService,
                           error: Error?) {
        if let error = error {
            setError("Characteristic discovery failed: \(error.localizedDescription)")
            central.cancelPeripheralConnection(peripheral)
            return
        }
        guard let char = service.characteristics?.first(where: { $0.uuid == Self.notifyUUID }) else {
            setError("Notify characteristic not found")
            central.cancelPeripheralConnection(peripheral)
            return
        }
        notifyChar = char
        peripheral.setNotifyValue(true, for: char)
        // maximumWriteValueLength gives the negotiated MTU minus ATT overhead;
        // logged here for diagnostics (notifications can carry up to MTU-3 bytes).
        let mtu = peripheral.maximumWriteValueLength(for: .withoutResponse)
        #if DEBUG
        print("AmpereOneBLE: negotiated payload ≈ \(mtu) bytes")
        #endif
    }

    public func peripheral(_ peripheral: CBPeripheral,
                           didUpdateNotificationStateFor characteristic: CBCharacteristic,
                           error: Error?) {
        if let error = error {
            setError("Subscribe failed: \(error.localizedDescription)")
            return
        }
        if characteristic.isNotifying {
            setState(.connected)
            setError(nil)
        }
    }

    public func peripheral(_ peripheral: CBPeripheral,
                           didUpdateValueFor characteristic: CBCharacteristic,
                           error: Error?) {
        if let error = error {
            setError("Read error: \(error.localizedDescription)")
            return
        }
        guard characteristic.uuid == Self.notifyUUID,
              let data = characteristic.value, !data.isEmpty else { return }
        ingest(data)
    }
}
