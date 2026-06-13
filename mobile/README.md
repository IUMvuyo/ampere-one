# Ampere One — Mobile BLE Clients

Standalone, drop-in Bluetooth-LE clients that connect to the **Ampere One** ESP32,
subscribe to its telemetry notify characteristic, and parse the JSON payload into
live UI values. No existing app is modified — copy the files you need into your project.

## BLE contract (from the ESP32 firmware)

| Item | Value |
| --- | --- |
| Service UUID | `a1b20001-5c6d-4e7f-8a9b-0c1d2e3f4a5b` |
| Notify characteristic UUID | `a1b20002-5c6d-4e7f-8a9b-0c1d2e3f4a5b` |
| Advertised device name | `Ampere One` |
| Payload (UTF-8 JSON, ~1 Hz) | `{"w":1234,"tank":80,"lpm":0.00,"leak":false}` |

Fields: `w` = watts (number), `tank` = tank percent 0–100 (`-1` means no echo /
unknown), `lpm` = water flow litres/min (number), `leak` = boolean.

Both clients:
- Scan filtered by the **service UUID** (name is a secondary check).
- Negotiate a larger MTU so a full JSON frame fits in one notification (iOS does
  this automatically; RN requests MTU 185).
- Reassemble fragmented / concatenated frames via a balanced-brace JSON splitter.
- Auto-reconnect on unexpected drops, and disconnect gracefully on demand.
- Surface error / permission / Bluetooth-off states to the UI.

---

## Files

```
mobile/
├── ios/
│   ├── AmpereOneBLE.swift     # ObservableObject CoreBluetooth manager
│   └── AmpereOneView.swift    # SwiftUI live view + Connect/Disconnect
└── react-native/
    ├── ampereOneBle.js        # useAmpereOneBle() hook (BleManager wrapper)
    └── AmpereOneScreen.jsx    # live screen + leak alert + connect button
```

---

## iOS (Swift / CoreBluetooth)

### 1. Add the files
Drag `AmpereOneBLE.swift` and `AmpereOneView.swift` into your Xcode target
(ensure **Target Membership** is checked). No package dependencies — CoreBluetooth
is part of the SDK.

### 2. Add the required Info.plist key
CoreBluetooth refuses to power on without a usage-description string. Add to
`Info.plist`:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Ampere One uses Bluetooth to read live power, water, and leak telemetry from your meter.</string>
```

> On iOS 12 and earlier the key is `NSBluetoothPeripheralUsageDescription`; add
> both if you support those versions.

### 3. Use it
```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack { AmpereOneView() }
    }
}
```

Or drive the manager yourself:
```swift
@StateObject private var ble = AmpereOneBLE()
// ble.connect() / ble.disconnect()
// ble.watts, ble.tankPct, ble.flowLpm, ble.leak, ble.isConnected, ble.state
```

> **Testing note:** BLE does not work in the iOS Simulator — run on a physical
> device.

---

## React Native (JSX / react-native-ble-plx)

### 1. Install the dependency
```bash
npm install react-native-ble-plx
# or: yarn add react-native-ble-plx
```

### 2. iOS pods
```bash
cd ios && pod install && cd ..
```

Add to the app's **iOS `Info.plist`** (same key as native iOS above):
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Ampere One uses Bluetooth to read live power, water, and leak telemetry from your meter.</string>
```

### 3. Android permissions
Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Android 12+ (API 31+) -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- Android 11 and below: BLE scan requires location -->
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"
    android:maxSdkVersion="30" />
```

> If you actually need location-derived BLE results on Android 12+, drop the
> `neverForLocation` flag and also request `ACCESS_FINE_LOCATION`.

The hook requests the **runtime** permissions for you
(`BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT` on API 31+, `ACCESS_FINE_LOCATION` below
that) via `PermissionsAndroid` when you call `connect()`.

Ensure `minSdkVersion` is at least 21 (react-native-ble-plx requirement).

### 4. Use it
```jsx
import AmpereOneScreen from './path/to/AmpereOneScreen';

export default function App() {
  return <AmpereOneScreen />;
}
```

Or consume the hook directly:
```jsx
import { useAmpereOneBle } from './path/to/ampereOneBle';

const {
  watts, tankPct, flowLpm, leak,
  isConnected, status, error,
  connect, disconnect,
} = useAmpereOneBle();
```

### Base64 note
`react-native-ble-plx` delivers characteristic values **base64-encoded**.
`ampereOneBle.js` decodes base64 → UTF-8 → JSON internally (using the platform
`atob` when available, with a dependency-free manual fallback), so no extra
buffer/base64 package is required.

> **Testing note:** BLE does not work in the iOS Simulator and is unreliable on
> Android emulators — test on physical devices.

---

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Stuck on "Scanning…" | Device not advertising, or out of range. Confirm the ESP32 is powered and advertising the service UUID. |
| iOS app crashes on launch | Missing `NSBluetoothAlwaysUsageDescription` in Info.plist. |
| Android "permission denied" | Manifest entries missing, or user denied the runtime prompt. Check app settings. |
| Values never update after connect | MTU too small for the frame and the device is fragmenting — both clients buffer + reassemble, but verify the firmware terminates each frame as one JSON object. |
| Reconnect storms | Expected on a flaky link; both clients back off `2s` between attempts. Call `disconnect()` to stop. |
