/**
 * AmpereOneScreen.jsx
 * Ampere One — standalone live telemetry screen (react-native-ble-plx).
 *
 * Renders watts / tank % / flow, a leak alert, and a connect/disconnect button
 * bound to the useAmpereOneBle hook. Drop in alongside ampereOneBle.js.
 */

import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAmpereOneBle, Status } from './ampereOneBle';

export default function AmpereOneScreen() {
  const {
    watts,
    tankPct,
    flowLpm,
    leak,
    isConnected,
    status,
    error,
    connect,
    disconnect,
  } = useAmpereOneBle();

  const busy =
    status === Status.Scanning ||
    status === Status.Connecting ||
    status === Status.Reconnecting;

  const onTogglePress = () => {
    if (isConnected || busy) {
      disconnect();
    } else {
      connect();
    }
  };

  const disabled =
    status === Status.BluetoothOff || status === Status.Unauthorized;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={[styles.dot, { backgroundColor: statusColor(status) }]} />
          <Text style={styles.headerText}>{statusLabel(status)}</Text>
        </View>

        <Text style={styles.title}>Ampere One</Text>

        {leak ? (
          <View style={styles.leakBanner}>
            <Text style={styles.leakTitle}>⚠  Leak detected</Text>
            <Text style={styles.leakBody}>
              Water flow continues with no expected draw.
            </Text>
          </View>
        ) : null}

        <View style={styles.grid}>
          <MetricCard
            label="Power"
            value={formatNum(watts, 0)}
            unit="W"
            accent="#F5A623"
          />
          <MetricCard
            label="Tank"
            value={tankPct < 0 ? '—' : String(tankPct)}
            unit={tankPct < 0 ? '' : '%'}
            accent="#2D9CDB"
          />
          <MetricCard
            label="Flow"
            value={formatNum(flowLpm, 2)}
            unit="L/min"
            accent="#27AE9F"
          />
          <MetricCard
            label="Leak"
            value={leak ? 'YES' : 'No'}
            unit=""
            accent={leak ? '#EB5757' : '#27AE60'}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isConnected || busy ? '#EB5757' : '#2F80ED' },
            disabled && styles.buttonDisabled,
          ]}
          onPress={onTogglePress}
          disabled={disabled}
          activeOpacity={0.85}>
          {busy ? <ActivityIndicator color="#fff" style={styles.spinner} /> : null}
          <Text style={styles.buttonText}>{buttonLabel(status, isConnected)}</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ label, value, unit, accent }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardLabel, { color: accent }]}>{label}</Text>
      <View style={styles.cardValueRow}>
        <Text style={styles.cardValue}>{value}</Text>
        {unit ? <Text style={styles.cardUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

/* ----------------------------- presentation ------------------------------ */

function formatNum(n, decimals) {
  const v = typeof n === 'number' ? n : 0;
  return v.toFixed(decimals);
}

function statusColor(status) {
  switch (status) {
    case Status.Connected:
      return '#27AE60';
    case Status.Scanning:
    case Status.Connecting:
    case Status.Reconnecting:
      return '#F2994A';
    case Status.BluetoothOff:
    case Status.Unauthorized:
    case Status.Error:
      return '#EB5757';
    default:
      return '#9B9B9B';
  }
}

function statusLabel(status) {
  switch (status) {
    case Status.Connected:
      return 'Connected';
    case Status.Scanning:
      return 'Scanning…';
    case Status.Connecting:
      return 'Connecting…';
    case Status.Reconnecting:
      return 'Reconnecting…';
    case Status.BluetoothOff:
      return 'Bluetooth off';
    case Status.Unauthorized:
      return 'Permission denied';
    case Status.Error:
      return 'Error';
    default:
      return 'Disconnected';
  }
}

function buttonLabel(status, isConnected) {
  if (isConnected) return 'Disconnect';
  switch (status) {
    case Status.Scanning:
      return 'Scanning… (tap to stop)';
    case Status.Connecting:
      return 'Connecting…';
    case Status.Reconnecting:
      return 'Reconnecting…';
    default:
      return 'Connect';
  }
}

/* -------------------------------- styles --------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0E1116' },
  container: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  headerText: { color: '#A0A4AB', fontSize: 14, fontWeight: '500' },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  leakBanner: {
    backgroundColor: '#EB5757',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  leakTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  leakBody: { color: '#fff', fontSize: 13, marginTop: 2, opacity: 0.9 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#1A1E26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  cardValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  cardUnit: { color: '#A0A4AB', fontSize: 15, fontWeight: '500', marginLeft: 4 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  spinner: { marginRight: 10 },
  error: {
    color: '#F2994A',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
});
