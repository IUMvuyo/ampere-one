'use client';
import { useState, useRef } from 'react';
import { searchPlaces } from '@/lib/geocode';

// Suburb/city search (Open-Meteo Geocoding, keyless) → sets the dashboard location
// so solar + air quality localise to the user instead of hardcoded Johannesburg.
export default function LocationPicker({ location, onChange }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const onType = (v) => {
    setQ(v);
    clearTimeout(timer.current);
    if (v.trim().length < 2) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      const r = await searchPlaces(v);
      setResults(r);
      setOpen(true);
    }, 250);
  };

  const pick = (p) => {
    onChange({ lat: p.lat, lng: p.lng, name: p.name });
    setQ('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative', minWidth: 240 }}>
      <div className="row" style={{ gap: 8 }}>
        <span className="muted" style={{ fontSize: 13 }}>📍 {location?.name || 'Johannesburg'}</span>
        <input
          value={q}
          onChange={(e) => onType(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Change location…"
          style={{ maxWidth: 180, padding: '7px 10px', fontSize: 13 }}
        />
      </div>
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '110%', right: 0, left: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 10, zIndex: 30, maxHeight: 240, overflowY: 'auto', boxShadow: '0 20px 40px -16px rgba(0,0,0,0.6)' }}>
          {results.map((p) => (
            <div
              key={p.id}
              onClick={() => pick(p)}
              style={{ padding: '9px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--line)' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <b>{p.name}</b> <span className="muted">{p.admin}{p.admin ? ', ' : ''}{p.cc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
