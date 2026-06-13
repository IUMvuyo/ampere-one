/**
 * ampereOneBle.js
 * Ampere One — standalone react-native-ble-plx client hook.
 *
 * Connects to an ESP32 advertising as "Ampere One", subscribes to its telemetry
 * notify characteristic, base64-decodes each notification into JSON, and exposes
 * live values plus connect/disconnect controls.
 *
 * BLE contract:
 *   Service UUID : a1b20001-5c6d-4e7f-8a9b-0c1d2e3f4a5b
 *   Notify char  : a1b20002-5c6d-4e7f-8a9b-0c1d2e3f4a5b
 *   Advert name  : "Ampere One"
 *   Payload (~1s): {"w":1234,"tank":80,"lpm":0.00,"leak":false}
 *
 * Peer dependency: react-native-ble-plx (see ../README.md for install/pod step).
 *
 * Usage:
 *   const { watts, tankPct, flowLpm, leak, isConnected, status, error,
 *           connect, disconnect } = useAmpereOneBle();
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export const AMPERE_ONE = {
  serviceUUID: 'a1b20001-5c6d-4e7f-8a9b-0c1d2e3f4a5b',
  notifyUUID: 'a1b20002-5c6d-4e7f-8a9b-0c1d2e3f4a5b',
  deviceName: 'Ampere One',
};

const RECONNECT_DELAY_MS = 2000;
const SCAN_TIMEOUT_MS = 15000;

// Connection status strings (also drive the UI).
export const Status = {
  Idle: 'idle',
  Scanning: 'scanning',
  Connecting: 'connecting',
  Connected: 'connected',
  Reconnecting: 'reconnecting',
  Unauthorized: 'unauthorized',
  BluetoothOff: 'bluetoothOff',
  Error: 'error',
};

/* -------------------------------------------------------------------------- */
/* base64 -> UTF-8 string (no external deps; works in Hermes/JSC)             */
/* -------------------------------------------------------------------------- */

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decode a base64 string to a UTF-8 JS string. Returns '' on bad input. */
export function base64ToUtf8(b64) {
  if (!b64) return '';

  // Prefer the platform decoder when present (faster, well-tested).
  if (typeof global !== 'undefined' && typeof global.atob === 'function') {
    try {
      const binary = global.atob(b64);
      return binaryToUtf8(binary);
    } catch (_) {
      /* fall through to manual decode */
    }
  }

  // Manual base64 -> bytes.
  const clean = String(b64).replace(/[^A-Za-z0-9+/]/g, '');
  let binary = '';
  let i = 0;
  while (i < clean.length) {
    const e1 = B64.indexOf(clean.charAt(i++));
    const e2 = B64.indexOf(clean.charAt(i++));
    const e3 = B64.indexOf(clean.charAt(i++));
    const e4 = B64.indexOf(clean.charAt(i++));

    const c1 = (e1 << 2) | (e2 >> 4);
    const c2 = ((e2 & 15) << 4) | (e3 >> 2);
    const c3 = ((e3 & 3) << 6) | e4;

    binary += String.fromCharCode(c1);
    if (e3 !== -1 && e3 !== 64) binary += String.fromCharCode(c2);
    if (e4 !== -1 && e4 !== 64) binary += String.fromCharCode(c3);
  }
  return binaryToUtf8(binary);
}

/** Interpret a binary (latin1) string as UTF-8 text. */
function binaryToUtf8(binary) {
  try {
    // Build a %-escaped sequence then decodeURI for proper multi-byte handling.
    let escaped = '';
    for (let i = 0; i < binary.length; i++) {
      const c = binary.charCodeAt(i) & 0xff;
      escaped += '%' + c.toString(16).padStart(2, '0');
    }
    return decodeURIComponent(escaped);
  } catch (_) {
    // ASCII fallback (telemetry JSON is ASCII, so this is safe).
    return binary;
  }
}

/* -------------------------------------------------------------------------- */
/* Frame parsing                                                              */
/* -------------------------------------------------------------------------- */

function toNumber(v, fallback) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Parse one telemetry JSON object into a normalized frame, or null. */
export function parseFrame(jsonStr) {
  if (!jsonStr) return null;
  let obj;
  try {
    obj = JSON.parse(jsonStr);
  } catch (_) {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;
  return {
    watts: toNumber(obj.w, 0),
    tankPct: Math.round(toNumber(obj.tank, -1)),
    flowLpm: toNumber(obj.lpm, 0),
    leak: obj.leak === true || obj.leak === 'true' || obj.leak === 1,
  };
}

/* -------------------------------------------------------------------------- */
/* Android runtime permissions                                               */
/* -------------------------------------------------------------------------- */

async function ensureAndroidPermissions() {
  if (Platform.OS !== 'android') return true;

  // API 31+ uses the new BLUETOOTH_SCAN / BLUETOOTH_CONNECT permissions.
  // Older devices still need ACCESS_FINE_LOCATION for BLE scanning.
  const apiLevel = Platform.Version;
  const perms = [];

  if (apiLevel >= 31) {
    perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
    perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
  } else {
    perms.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  }

  const granted = await PermissionsAndroid.requestMultiple(perms);
  return perms.every(
    (p) => granted[p] === PermissionsAndroid.RESULTS.GRANTED,
  );
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useAmpereOneBle() {
  const [watts, setWatts] = useState(0);
  const [tankPct, setTankPct] = useState(-1);
  const [flowLpm, setFlowLpm] = useState(0);
  const [leak, setLeak] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState(Status.Idle);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // One shared BleManager for the lifetime of the hook.
  const managerRef = useRef(null);
  const deviceRef = useRef(null);
  const monitorSubRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const scanTimerRef = useRef(null);
  const wantConnectedRef = useRef(false); // drives auto-reconnect
  const rxBufferRef = useRef('');         // reassembles fragmented JSON

  if (managerRef.current === null) {
    managerRef.current = new BleManager();
  }

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  }, []);

  const applyFrame = useCallback((frame) => {
    setWatts(frame.watts);
    setTankPct(frame.tankPct);
    setFlowLpm(frame.flowLpm);
    setLeak(frame.leak);
    setLastUpdate(Date.now());
    setError(null);
  }, []);

  // Decode a notification value (base64) into one or more frames.
  const ingest = useCallback(
    (base64Value) => {
      const text = base64ToUtf8(base64Value);
      if (!text) return;

      // Fast path: a single complete object per notification.
      const single = parseFrame(text);
      if (single) {
        applyFrame(single);
        rxBufferRef.current = '';
        return;
      }

      // Slow path: buffer + split on balanced braces (handles fragmentation
      // and concatenated "}{").
      let buf = rxBufferRef.current + text;
      if (buf.length > 4096) buf = text; // overflow guard

      let depth = 0;
      let start = -1;
      let consumedTo = 0;
      for (let i = 0; i < buf.length; i++) {
        const ch = buf[i];
        if (ch === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (ch === '}') {
          depth--;
          if (depth === 0 && start >= 0) {
            const frame = parseFrame(buf.slice(start, i + 1));
            if (frame) {
              applyFrame(frame);
              consumedTo = i + 1;
            }
            start = -1;
          }
        }
      }
      rxBufferRef.current = buf.slice(consumedTo);
    },
    [applyFrame],
  );

  const teardownConnection = useCallback(() => {
    if (monitorSubRef.current) {
      monitorSubRef.current.remove();
      monitorSubRef.current = null;
    }
    deviceRef.current = null;
    rxBufferRef.current = '';
    setIsConnected(false);
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!wantConnectedRef.current) return;
    clearTimers();
    setStatus(Status.Reconnecting);
    reconnectTimerRef.current = setTimeout(() => {
      // eslint-disable-next-line no-use-before-define
      connect();
    }, RECONNECT_DELAY_MS);
  }, [clearTimers]);

  const startMonitoring = useCallback(
    async (device) => {
      // Negotiate a larger MTU so a full JSON frame fits in one notification.
      try {
        await device.requestMTU(185);
      } catch (_) {
        /* MTU negotiation is best-effort; default 23 still works for small JSON */
      }

      await device.discoverAllServicesAndCharacteristics();

      monitorSubRef.current = device.monitorCharacteristicForService(
        AMPERE_ONE.serviceUUID,
        AMPERE_ONE.notifyUUID,
        (err, characteristic) => {
          if (err) {
            // Cancellation during teardown is expected — ignore it.
            if (err?.errorCode === 2 /* OperationCancelled */) return;
            setError(`Notify error: ${err.message || err}`);
            return;
          }
          if (characteristic?.value) ingest(characteristic.value);
        },
      );

      // Surface unexpected disconnects -> auto-reconnect.
      device.onDisconnected((discErr) => {
        teardownConnection();
        if (discErr) setError(`Disconnected: ${discErr.message || discErr}`);
        scheduleReconnect();
      });

      setIsConnected(true);
      setStatus(Status.Connected);
      setError(null);
    },
    [ingest, scheduleReconnect, teardownConnection],
  );

  const connect = useCallback(async () => {
    wantConnectedRef.current = true;
    setError(null);

    const manager = managerRef.current;

    // Permissions (Android) + radio state.
    const ok = await ensureAndroidPermissions();
    if (!ok) {
      setStatus(Status.Unauthorized);
      setError('Bluetooth/location permission denied');
      return;
    }

    const btState = await manager.state();
    if (btState === 'PoweredOff') {
      setStatus(Status.BluetoothOff);
      setError('Bluetooth is powered off');
      return;
    }

    clearTimers();
    setStatus(Status.Scanning);

    // Stop scanning after a timeout if nothing is found.
    scanTimerRef.current = setTimeout(() => {
      manager.stopDeviceScan();
      if (!deviceRef.current) {
        setError('Ampere One not found');
        setStatus(wantConnectedRef.current ? Status.Reconnecting : Status.Idle);
        if (wantConnectedRef.current) scheduleReconnect();
      }
    }, SCAN_TIMEOUT_MS);

    manager.startDeviceScan(
      [AMPERE_ONE.serviceUUID],
      { allowDuplicates: false },
      async (scanErr, device) => {
        if (scanErr) {
          manager.stopDeviceScan();
          clearTimers();
          setStatus(Status.Error);
          setError(`Scan error: ${scanErr.message || scanErr}`);
          scheduleReconnect();
          return;
        }
        if (!device) return;

        // Service-UUID filter is authoritative; name is a secondary check.
        const name = device.name || device.localName;
        if (name && name !== AMPERE_ONE.deviceName) return;

        // Found it — stop scanning and connect.
        manager.stopDeviceScan();
        clearTimers();
        setStatus(Status.Connecting);
        try {
          const connected = await device.connect();
          deviceRef.current = connected;
          await startMonitoring(connected);
        } catch (e) {
          setError(`Connect failed: ${e.message || e}`);
          teardownConnection();
          scheduleReconnect();
        }
      },
    );
  }, [clearTimers, scheduleReconnect, startMonitoring, teardownConnection]);

  const disconnect = useCallback(async () => {
    wantConnectedRef.current = false;
    clearTimers();
    const manager = managerRef.current;
    manager.stopDeviceScan();
    const device = deviceRef.current;
    try {
      if (device && (await device.isConnected())) {
        await device.cancelConnection();
      }
    } catch (_) {
      /* already gone */
    }
    teardownConnection();
    setStatus(Status.Idle);
  }, [clearTimers, teardownConnection]);

  // Cleanup on unmount: destroy the manager and all subscriptions.
  useEffect(() => {
    return () => {
      wantConnectedRef.current = false;
      clearTimers();
      if (monitorSubRef.current) monitorSubRef.current.remove();
      const manager = managerRef.current;
      if (manager) {
        manager.stopDeviceScan();
        manager.destroy();
        managerRef.current = null;
      }
    };
  }, [clearTimers]);

  return useMemo(
    () => ({
      watts,
      tankPct,
      flowLpm,
      leak,
      isConnected,
      status,
      error,
      lastUpdate,
      connect,
      disconnect,
    }),
    [
      watts,
      tankPct,
      flowLpm,
      leak,
      isConnected,
      status,
      error,
      lastUpdate,
      connect,
      disconnect,
    ],
  );
}

export default useAmpereOneBle;
