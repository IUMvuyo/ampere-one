// Web Bluetooth client — the browser talks directly to the Ampere One ESP32.
// Matches firmware/ampere_one.ino: service + notify characteristic emitting JSON.

export const SERVICE_UUID = 'a1b20001-5c6d-4e7f-8a9b-0c1d2e3f4a5b';
export const CHAR_UUID = 'a1b20002-5c6d-4e7f-8a9b-0c1d2e3f4a5b';

export function bleSupported() {
  return typeof navigator !== 'undefined' && !!navigator.bluetooth;
}

// Connect, subscribe to notifications, parse JSON, call onData({w,tank,lpm,leak}).
// Returns the device so the caller can disconnect / listen for gattserverdisconnected.
export async function connectAmpereOne(onData, onDisconnect) {
  if (!bleSupported()) throw new Error('Web Bluetooth not available in this browser. Use Chrome/Edge on desktop or Android.');

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'Ampere' }, { services: [SERVICE_UUID] }],
    optionalServices: [SERVICE_UUID],
  });

  device.addEventListener('gattserverdisconnected', () => { if (onDisconnect) onDisconnect(); });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);
  const ch = await service.getCharacteristic(CHAR_UUID);

  const decoder = new TextDecoder();
  ch.addEventListener('characteristicvaluechanged', (e) => {
    try {
      const json = decoder.decode(e.target.value);
      const d = JSON.parse(json);
      onData({ w: +d.w || 0, tank: d.tank == null ? -1 : +d.tank, lpm: +d.lpm || 0, leak: !!d.leak });
    } catch (_) { /* ignore malformed frame */ }
  });
  await ch.startNotifications();

  return device;
}

export function disconnect(device) {
  try { if (device && device.gatt && device.gatt.connected) device.gatt.disconnect(); } catch (_) {}
}
