// lib/timeUtils.ts — Time-based utilities for dynamic sky and greeting

/**
 * Get the visitor's local hour (0-23).
 */
export function getLocalHour(): number {
  return new Date().getHours();
}

/**
 * Get a time-of-day category for sky coloring.
 */
export function getTimeOfDay(): 'dawn' | 'day' | 'dusk' | 'night' {
  const h = getLocalHour();
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

/**
 * Get sky colors based on time of day.
 * Returns [topColor, bottomColor, sunColor] as hex strings.
 */
export function getSkyColors(): [string, string, string] {
  const tod = getTimeOfDay();
  switch (tod) {
    case 'dawn':
      return ['#1a0a2e', '#ff6b35', '#ffaa00'];
    case 'day':
      return ['#0a1628', '#1e3a5f', '#00f0ff'];
    case 'dusk':
      return ['#1a0520', '#cc3366', '#ff6b35'];
    case 'night':
      return ['#050510', '#0a0a2e', '#4444aa'];
  }
}

/**
 * Get a time-appropriate greeting.
 */
export function getGreeting(): string {
  const h = getLocalHour();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Hey there, night owl';
}
