// Demo telemetry generator — a realistic SA-home day on fast-forward.
// Emits the same shape the ESP32 sends over BLE: { w, tank, lpm, leak }.
// Lets judges see the full product alive with no hardware on the table.

export function createSimulator() {
  let t = 0;                 // ticks (≈ seconds)
  let tank = 86;             // % full JoJo tank
  let leakActive = false;

  // Scripted appliance/water events on a ~90s looping "day".
  // [startTick, endTick, watts] for appliances
  const applianceEvents = [
    [3, 8, 2050],    // kettle
    [12, 40, 3100],  // geyser heating
    [20, 26, 1300],  // microwave
    [30, 50, 480],   // washing machine
    [55, 62, 2000],  // kettle again
    [60, 88, 850],   // pool pump
  ];
  // [startTick, endTick, lpm] for taps/showers
  const waterEvents = [
    [5, 9, 7.5],     // tap fill
    [18, 30, 9.2],   // shower
    [58, 63, 6.0],   // tap
  ];

  const baseLight = 130; // fridge + standby

  return {
    next() {
      const cycle = t % 92;
      let w = baseLight + Math.round((Math.sin(t / 3) * 8)); // small jitter
      for (const [a, b, watts] of applianceEvents) {
        if (cycle >= a && cycle < b) w += watts + Math.round(Math.sin(t) * 25);
      }

      let lpm = 0;
      for (const [a, b, f] of waterEvents) {
        if (cycle >= a && cycle < b) lpm += f + Math.sin(t / 2) * 0.4;
      }

      // A leak begins at cycle 70 and persists (the dramatic demo moment).
      if (cycle >= 70) { leakActive = true; lpm += 0.35; }
      else if (cycle < 5) { leakActive = false; }

      // Tank drains with usage, refills slowly when idle.
      tank -= lpm * 0.018;
      if (lpm < 0.1) tank += 0.02;
      tank = Math.max(8, Math.min(100, tank));

      t++;
      return {
        w: Math.max(0, Math.round(w)),
        tank: Math.round(tank),
        lpm: Math.max(0, +lpm.toFixed(2)),
        leak: leakActive && lpm > 0 && lpm < 1.2,
      };
    },
  };
}
