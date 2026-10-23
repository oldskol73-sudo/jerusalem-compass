// Geography, math helpers, and content constants for Face Jerusalem.

export const JERUSALEM_LAT = 31.778;
export const JERUSALEM_LON = 35.2354;
const EARTH_R_KM = 6371.0088;
const KM_TO_MI = 0.621371192237334;

export function toRad(d: number) {
  return (d * Math.PI) / 180;
}
export function toDeg(r: number) {
  return (r * 180) / Math.PI;
}
export function normalize(d: number) {
  return ((d % 360) + 360) % 360;
}
export function signedDelta(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}

export const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const;

export function compassPointFor(deg: number) {
  const n = normalize(deg);
  const idx = Math.floor((n + 11.25) / 22.5) % 16;
  return COMPASS_POINTS[idx];
}

export function dms(value: number, pos: string, neg: string) {
  const hemi = value >= 0 ? pos : neg;
  const abs = Math.abs(value);
  const d = Math.floor(abs);
  const minutesFull = (abs - d) * 60;
  const m = Math.floor(minutesFull);
  const sec = Math.round((minutesFull - m) * 60);
  return `${d}°${m}'${sec}" ${hemi}`;
}

export function bearingTo(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p1 = toRad(lat1), p2 = toRad(lat2), dl = toRad(lon2 - lon1);
  const x = Math.sin(dl) * Math.cos(p2);
  const y = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return normalize(toDeg(Math.atan2(x, y)));
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p1 = toRad(lat1), p2 = toRad(lat2);
  const dp = toRad(lat2 - lat1), dl = toRad(lon2 - lon1);
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return EARTH_R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number) {
  const mi = km * KM_TO_MI;
  const kmStr = km < 50 ? km.toFixed(1) : Math.round(km).toLocaleString();
  const miStr = mi < 50 ? mi.toFixed(1) : Math.round(mi).toLocaleString();
  return `${miStr} mi · ${kmStr} km`;
}

export type LocationPreset = { name: string; lat: number; lon: number };
export const PRESETS: Record<string, LocationPreset> = {
  ny: { name: 'New York, NY', lat: 40.7128, lon: -74.006 },
  la: { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437 },
  london: { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  joburg: { name: 'Johannesburg, ZA', lat: -26.2041, lon: 28.0473 },
  sydney: { name: 'Sydney, AU', lat: -33.8688, lon: 151.2093 },
};

export type Atmosphere = 'parchment' | 'stone' | 'midnight';

export type ThemeTokens = {
  bg: string; surface: string; card: string; sheet: string; navbg: string;
  text: string; muted: string; border: string; accent: string; onaccent: string;
  gold: string; brassring: string; dialbase: string; dialhi: string; dialtext: string;
  needle: string; glow: string; navactive: string; navinactive: string;
};

export const THEMES: Record<Atmosphere, ThemeTokens> = {
  parchment: {
    bg: '#E8D9B8', surface: '#F3EAD4', card: '#FBF6EA', sheet: '#FBF6EA', navbg: '#F3EAD4',
    text: '#1A1A1A', muted: 'rgba(26,26,26,.62)', border: 'rgba(26,26,26,.14)',
    accent: '#A77A32', onaccent: '#F4F1E8', gold: '#D8B25C', brassring: '#A77A32',
    dialbase: '#EFE4C8', dialhi: '#FBF3DE', dialtext: '#1A1A1A', needle: '#A77A32',
    glow: 'rgba(216,178,92,.5)', navactive: '#4A3818', navinactive: '#6B5730',
  },
  stone: {
    bg: '#C9B99A', surface: '#D9CCB2', card: '#EFE7D6', sheet: '#EFE7D6', navbg: '#D9CCB2',
    text: '#2B2B2B', muted: 'rgba(43,43,43,.62)', border: 'rgba(26,26,26,.14)',
    accent: '#8C6A34', onaccent: '#F4F1E8', gold: '#D8B25C', brassring: '#8C6A34',
    dialbase: '#E4DAC4', dialhi: '#F1E9D6', dialtext: '#2B2B2B', needle: '#8C6A34',
    glow: 'rgba(216,178,92,.45)', navactive: '#4A3818', navinactive: '#6B5730',
  },
  midnight: {
    bg: '#0B1020', surface: '#141B2E', card: 'rgba(255,255,255,.07)', sheet: '#141B2E', navbg: '#0F1526',
    text: '#F4F1E8', muted: 'rgba(244,241,232,.6)', border: 'rgba(244,241,232,.14)',
    accent: '#D8B25C', onaccent: '#1A1A1A', gold: '#D8B25C', brassring: '#D8B25C',
    dialbase: '#1A2338', dialhi: '#26314C', dialtext: '#F4F1E8', needle: '#D8B25C',
    glow: 'rgba(216,178,92,.6)', navactive: '#D8B25C', navinactive: 'rgba(244,241,232,.6)',
  },
};

export type Reminder = { id: string; label: string; time: string; on: boolean; custom?: boolean };
export const DEFAULT_REMINDERS: Reminder[] = [
  { id: 'morning', label: 'Morning', time: '06:00', on: true },
  { id: 'midday', label: 'Midday', time: '12:00', on: true },
  { id: 'evening', label: 'Evening', time: '18:00', on: true },
];

export type Site = { name: string; book: string; chapter: number; verse: number; endVerse?: number; text: string };
export const SITES: Site[] = [
  { name: 'Temple Mount', book: '2 Chronicles', chapter: 3, verse: 1, text: 'Mount Moriah, where Solomon built the house of the LORD. The Second Temple stood here after the return from Babylon and was enlarged by Herod before its destruction in AD 70.' },
  { name: 'Western Wall', book: '1 Kings', chapter: 8, verse: 29, endVerse: 30, text: 'At the Temple’s dedication, Solomon asked that God’s eyes be open toward this house night and day, and that He would hear and forgive when His people pray toward this place. The Western Wall, a retaining wall of the Temple Mount from Herod’s time, is where many still pray toward that site.' },
  { name: 'City of David', book: '2 Samuel', chapter: 5, verse: 7, text: 'The oldest settled part of Jerusalem, on the ridge south of the Temple Mount. David took the stronghold of Zion here and made it his capital.' },
  { name: 'Pool of Siloam', book: 'John', chapter: 9, verse: 7, text: 'Fed by the Gihon spring through Hezekiah’s tunnel. Jesus sent the man born blind to wash here, and he came back seeing.' },
  { name: 'Mount of Olives', book: 'Acts', chapter: 1, verse: 12, text: 'The ridge east of the Old City across the Kidron Valley. Jesus taught here, wept over the city, and ascended from its slopes.' },
  { name: 'Garden of Gethsemane', book: 'Matthew', chapter: 26, verse: 36, text: 'An olive grove at the foot of the Mount of Olives, where Jesus prayed on the night he was betrayed.' },
];

export type VerseRef = [book: string, chapter: number, verse: number];
export const HIGHLIGHTS: { label: string; refs: VerseRef[] }[] = [
  { label: 'Jerusalem', refs: [['Daniel', 6, 10], ['Psalms', 122, 6], ['Psalms', 137, 5], ['Psalms', 125, 2], ['Psalms', 51, 18], ['Isaiah', 62, 6], ['Isaiah', 40, 2], ['1 Kings', 8, 48], ['Daniel', 9, 16], ['Zechariah', 8, 3]] },
  { label: 'Prayer', refs: [['Matthew', 6, 6], ['Philippians', 4, 6], ['1 Thessalonians', 5, 17], ['James', 5, 16], ['Jeremiah', 29, 12], ['Psalms', 5, 3], ['Psalms', 55, 17], ['Mark', 11, 24], ['Romans', 12, 12], ['2 Chronicles', 7, 14]] },
  { label: 'Thanksgiving', refs: [['Psalms', 100, 4], ['Psalms', 107, 1], ['Psalms', 136, 1], ['Psalms', 95, 2], ['Psalms', 92, 1], ['1 Chronicles', 16, 34], ['1 Thessalonians', 5, 18], ['Colossians', 4, 2], ['Ephesians', 5, 20], ['Hebrews', 13, 15]] },
];

export type AlignmentState =
  | 'unavailable' | 'turn-left' | 'turn-right' | 'behind'
  | 'almost-aligned' | 'stabilizing' | 'aligned' | 'in-jerusalem';

export const ALIGNMENT_TEXT: Record<AlignmentState, string> = {
  unavailable: 'Location unavailable',
  'turn-left': 'Turn left',
  'turn-right': 'Turn right',
  behind: 'Jerusalem is behind you',
  'almost-aligned': 'Almost aligned',
  stabilizing: 'Hold steady',
  aligned: 'You are facing Jerusalem',
  'in-jerusalem': 'You are in Jerusalem.',
};

export type Confidence = 'unavailable' | 'limited' | 'good' | 'high';
export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  unavailable: 'Unavailable', limited: 'Limited', good: 'Good', high: 'High',
};

export const DEFAULT_VERSE_TEXT =
  'Now when Daniel knew that the writing was signed, he went into his house; and his windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day, and prayed, and gave thanks before his God, as he did aforetime.';
export const DEFAULT_VERSE_REF = 'Daniel 6:10';
