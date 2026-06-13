//
//  AmpereOneView.swift
//  Ampere One — standalone SwiftUI live telemetry view
//
//  Renders watts / tank % / flow and a leak banner, with a Connect/Disconnect
//  button bound to AmpereOneBLE. Drop in alongside AmpereOneBLE.swift.
//

import SwiftUI

public struct AmpereOneView: View {
    @StateObject private var ble = AmpereOneBLE()

    public init() {}

    public var body: some View {
        ScrollView {
            VStack(spacing: 20) {

                header

                if ble.leak {
                    leakBanner
                }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())],
                          spacing: 16) {
                    metricCard(title: "Power",
                               value: formatted(ble.watts, decimals: 0),
                               unit: "W",
                               systemImage: "bolt.fill",
                               tint: .yellow)

                    metricCard(title: "Tank",
                               value: ble.tankPct < 0 ? "—" : "\(ble.tankPct)",
                               unit: ble.tankPct < 0 ? "" : "%",
                               systemImage: "drop.fill",
                               tint: .blue)

                    metricCard(title: "Flow",
                               value: formatted(ble.flowLpm, decimals: 2),
                               unit: "L/min",
                               systemImage: "water.waves",
                               tint: .teal)

                    metricCard(title: "Leak",
                               value: ble.leak ? "YES" : "No",
                               unit: "",
                               systemImage: ble.leak ? "exclamationmark.triangle.fill" : "checkmark.seal.fill",
                               tint: ble.leak ? .red : .green)
                }

                connectButton

                statusFooter
            }
            .padding()
        }
        .navigationTitle("Ampere One")
    }

    // MARK: - Subviews

    private var header: some View {
        HStack(spacing: 10) {
            Circle()
                .fill(connectionColor)
                .frame(width: 12, height: 12)
            Text(connectionLabel)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.secondary)
            Spacer()
            if let updated = ble.lastUpdate {
                Text(updated, style: .relative)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var leakBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.title2)
            VStack(alignment: .leading, spacing: 2) {
                Text("Leak detected")
                    .font(.headline)
                Text("Water flow continues with no expected draw.")
                    .font(.caption)
                    .opacity(0.9)
            }
            Spacer()
        }
        .foregroundStyle(.white)
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.red, in: RoundedRectangle(cornerRadius: 14))
        .transition(.move(edge: .top).combined(with: .opacity))
        .animation(.spring(duration: 0.3), value: ble.leak)
    }

    private func metricCard(title: String,
                            value: String,
                            unit: String,
                            systemImage: String,
                            tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: systemImage)
                    .foregroundStyle(tint)
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                Spacer()
            }
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(value)
                    .font(.system(size: 34, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .contentTransition(.numericText())
                if !unit.isEmpty {
                    Text(unit)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var connectButton: some View {
        Button {
            if ble.isConnected || ble.state == .scanning
                || ble.state == .connecting || ble.state == .reconnecting {
                ble.disconnect()
            } else {
                ble.connect()
            }
        } label: {
            HStack {
                if ble.state == .scanning || ble.state == .connecting || ble.state == .reconnecting {
                    ProgressView()
                        .tint(.white)
                }
                Text(buttonLabel)
                    .font(.headline)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
        }
        .background(buttonColor, in: RoundedRectangle(cornerRadius: 14))
        .foregroundStyle(.white)
        .disabled(ble.state == .poweredOff || ble.state == .unsupported || ble.state == .unauthorized)
    }

    private var statusFooter: some View {
        VStack(spacing: 4) {
            if let err = ble.lastError {
                Label(err, systemImage: "info.circle")
                    .font(.caption)
                    .foregroundStyle(.orange)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 4)
    }

    // MARK: - Derived presentation

    private var connectionColor: Color {
        switch ble.state {
        case .connected: return .green
        case .scanning, .connecting, .reconnecting: return .orange
        case .poweredOff, .unauthorized, .unsupported: return .red
        case .idle: return .gray
        }
    }

    private var connectionLabel: String {
        switch ble.state {
        case .connected: return "Connected"
        case .scanning: return "Scanning…"
        case .connecting: return "Connecting…"
        case .reconnecting: return "Reconnecting…"
        case .idle: return "Disconnected"
        case .poweredOff: return "Bluetooth off"
        case .unauthorized: return "Bluetooth denied"
        case .unsupported: return "BLE unsupported"
        }
    }

    private var buttonLabel: String {
        switch ble.state {
        case .connected: return "Disconnect"
        case .scanning: return "Scanning… (tap to stop)"
        case .connecting: return "Connecting…"
        case .reconnecting: return "Reconnecting…"
        default: return "Connect"
        }
    }

    private var buttonColor: Color {
        if ble.isConnected || ble.state == .scanning
            || ble.state == .connecting || ble.state == .reconnecting {
            return .red
        }
        return .accentColor
    }

    private func formatted(_ value: Double, decimals: Int) -> String {
        String(format: "%.\(decimals)f", value)
    }
}

#Preview {
    NavigationStack {
        AmpereOneView()
    }
}
