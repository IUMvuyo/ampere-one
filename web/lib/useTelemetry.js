'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { createSimulator } from './sim';
import { createNilm } from './nilm';
import { connectAmpereOne, disconnect as bleDisconnect, bleSupported } from './ble';

const HISTORY = 120; // ~2 min of 1s samples

// Single hook that powers the whole dashboard: device (Web Bluetooth) OR demo,
// integrating energy/water totals and running live appliance disaggregation.
export function useTelemetry() {
  const [latest, setLatest] = useState({ w: 0, tank: 0, lpm: 0, leak: false });
  const [history, setHistory] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [source, setSource] = useState('idle'); // idle | demo | device
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({ kwh: 0, litres: 0 });

  const nilmRef = useRef(createNilm());
  const simRef = useRef(null);
  const intervalRef = useRef(null);
  const deviceRef = useRef(null);
  const lastTsRef = useRef(null);

  const handleSample = useCallback((d) => {
    const now = Date.now();
    const dt = lastTsRef.current ? Math.min(5, (now - lastTsRef.current) / 1000) : 1;
    lastTsRef.current = now;

    setLatest(d);
    setHistory((h) => [...h.slice(-(HISTORY - 1)), { t: now, w: d.w }]);
    setAppliances(nilmRef.current.push(d.w));
    setTotals((prev) => ({
      kwh: prev.kwh + (d.w / 1000) * (dt / 3600),
      litres: prev.litres + (d.lpm / 60) * dt,
    }));
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (deviceRef.current) { bleDisconnect(deviceRef.current); deviceRef.current = null; }
    setSource('idle');
  }, []);

  const reset = useCallback(() => {
    nilmRef.current = createNilm();
    lastTsRef.current = null;
    setHistory([]); setAppliances([]); setTotals({ kwh: 0, litres: 0 });
    setLatest({ w: 0, tank: 0, lpm: 0, leak: false });
  }, []);

  const startDemo = useCallback(() => {
    stop(); reset();
    simRef.current = createSimulator();
    setSource('demo'); setError(null);
    intervalRef.current = setInterval(() => handleSample(simRef.current.next()), 1000);
  }, [stop, reset, handleSample]);

  const connectDevice = useCallback(async () => {
    stop(); reset(); setError(null);
    try {
      const device = await connectAmpereOne(handleSample, () => { setSource('idle'); });
      deviceRef.current = device;
      setSource('device');
    } catch (e) {
      setError(e.message || 'Connection failed');
      setSource('idle');
    }
  }, [stop, reset, handleSample]);

  useEffect(() => () => stop(), [stop]); // cleanup on unmount

  return {
    latest, history, appliances, source, error, totals,
    supported: bleSupported(),
    startDemo, connectDevice, stop,
  };
}
