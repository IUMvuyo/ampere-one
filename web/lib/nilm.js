// Lightweight on-the-fly appliance disaggregation (NILM-lite).
// Detects step changes in whole-home watts and matches each step to a known SA appliance signature.

export const SIGNATURES = [
  { name: 'Geyser',        icon: '🔥', min: 2600, max: 3600, color: '#f0556a' },
  { name: 'Kettle',        icon: '☕', min: 1700, max: 2400, color: '#f5b301' },
  { name: 'Oven / Stove',  icon: '🍳', min: 1500, max: 2600, color: '#fb923c' },
  { name: 'Iron',          icon: '👕', min: 1000, max: 1600, color: '#f59e0b' },
  { name: 'Microwave',     icon: '🍲', min: 800,  max: 1400, color: '#eab308' },
  { name: 'Washing machine', icon: '🧺', min: 400,  max: 900,  color: '#a3e635' },
  { name: 'Pool pump',     icon: '🏊', min: 600,  max: 1100, color: '#38bdf8' },
  { name: 'Fridge',        icon: '🧊', min: 80,   max: 250,  color: '#60a5fa' },
  { name: 'TV / electronics', icon: '📺', min: 40,   max: 200,  color: '#a78bfa' },
];

function classify(deltaW) {
  const w = Math.abs(deltaW);
  // prefer the signature whose band centre is closest
  let best = null, bestDist = Infinity;
  for (const s of SIGNATURES) {
    if (w >= s.min && w <= s.max) {
      const centre = (s.min + s.max) / 2;
      const d = Math.abs(w - centre);
      if (d < bestDist) { bestDist = d; best = s; }
    }
  }
  return best;
}

// Stateful detector. Feed it watt samples; it returns the current set of "on" appliances.
export function createNilm({ stepThreshold = 120 } = {}) {
  let prev = null;
  const on = []; // [{name, icon, watts, color, id}]
  let idc = 0;

  return {
    push(watts) {
      if (prev == null) { prev = watts; return on.slice(); }
      const delta = watts - prev;
      if (delta > stepThreshold) {
        const sig = classify(delta);
        if (sig) on.push({ ...sig, watts: Math.round(delta), id: ++idc });
      } else if (delta < -stepThreshold) {
        // turn off the on-appliance whose draw best matches this drop
        const drop = Math.abs(delta);
        let idx = -1, bd = Infinity;
        on.forEach((a, i) => { const d = Math.abs(a.watts - drop); if (d < bd) { bd = d; idx = i; } });
        if (idx >= 0 && bd < 400) on.splice(idx, 1);
      }
      prev = watts;
      return on.slice();
    },
    current() { return on.slice(); },
  };
}
