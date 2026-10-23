import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  ALIGNMENT_TEXT,
  type AlignmentState,
  type Atmosphere,
  bearingTo,
  type Confidence,
  DEFAULT_REMINDERS,
  formatDistance,
  haversineKm,
  JERUSALEM_LAT,
  JERUSALEM_LON,
  normalize,
  type Reminder,
  signedDelta,
  THEMES,
} from '@/constants/jerusalem';
import { loadBible, verseRef, verseText, type VerseLoc } from '@/lib/bible';

type LocationSource = 'demo' | 'gps' | 'manual';
type LocationPermission = 'unknown' | 'granted' | 'denied' | 'unavailable';
type CalibrationStatus = 'unknown' | 'recommended' | 'ready';
type SessionPhase = null | 'active' | 'paused' | 'complete';

export type JournalEntry = { id: number; at: number; text: string };
export type HistoryEntry = {
  id: number; at: number; period: number; minutes: number; planned: number;
  verse: string | null; bearing: number;
};

const STORAGE_KEYS = {
  showCoverAtLaunch: 'fj_showCoverAtLaunch',
  journal: 'fj_journal',
  history: 'fj_history',
  saved: 'fj_saved',
  reminders: 'fj_reminders',
  snoozeMin: 'fj_snoozeMin',
  atmosphere: 'fj_atmosphere',
  haptics: 'fj_haptics',
  silent: 'fj_silent',
  duration: 'fj_duration',
  musicApp: 'fj_musicApp',
} as const;

const NEW_YORK = { name: 'New York, NY', lat: 40.7128, lon: -74.006 };

type State = {
  atmosphere: Atmosphere;
  showCoverAtLaunch: boolean;

  lat: number;
  lon: number;
  locationSource: LocationSource;
  locationLabel: string | null;
  locationAccuracyM: number | null;
  locationPermission: LocationPermission;

  smoothedHeading: number;
  headingAvailable: boolean;
  magHeading: number | null;

  bearingDeg: number;
  distanceKm: number;
  relativeAngle: number;
  alignmentState: AlignmentState;
  calibrationStatus: CalibrationStatus;

  locConf: Confidence;
  headConf: Confidence;
  overallConf: Confidence;

  hapticsEnabled: boolean;
  silentMode: boolean;
  prayerDuration: number;

  sessionPhase: SessionPhase;
  sessionAccumMs: number;
  sessionResumedAt: number;
  attachedVerse: VerseLoc | null;

  journal: JournalEntry[];
  history: HistoryEntry[];
  savedVerses: VerseLoc[];

  reminders: Reminder[];
  snoozeMin: number;
  reminderBanner: { label: string } | null;
  snoozeUntil: number | null;

  musicApp: string | null;

  bibleReady: boolean;
  scrBook: number;
  scrChapter: number;
  scrVerse: number | null;

  lastUpdate: number | null;
};

const initialState: State = {
  atmosphere: 'stone',
  showCoverAtLaunch: true,

  lat: NEW_YORK.lat,
  lon: NEW_YORK.lon,
  locationSource: 'demo',
  locationLabel: NEW_YORK.name,
  locationAccuracyM: null,
  locationPermission: 'unknown',

  smoothedHeading: 0,
  headingAvailable: false,
  magHeading: null,

  bearingDeg: 0,
  distanceKm: 0,
  relativeAngle: 0,
  alignmentState: 'unavailable',
  calibrationStatus: 'unknown',

  locConf: 'limited',
  headConf: 'limited',
  overallConf: 'limited',

  hapticsEnabled: true,
  silentMode: false,
  prayerDuration: 10,

  sessionPhase: null,
  sessionAccumMs: 0,
  sessionResumedAt: 0,
  attachedVerse: null,

  journal: [],
  history: [],
  savedVerses: [],

  reminders: DEFAULT_REMINDERS,
  snoozeMin: 10,
  reminderBanner: null,
  snoozeUntil: null,

  musicApp: null,

  bibleReady: false,
  scrBook: 26, // Daniel
  scrChapter: 5, // chapter 6
  scrVerse: 9, // verse 10

  lastUpdate: null,
};

type Ctx = State & {
  theme: (typeof THEMES)['stone'];
  isAligned: boolean;
  alignmentLabel: string;

  setAtmosphere: (a: Atmosphere) => void;
  toggleShowCoverAtLaunch: () => void;

  setManualLocation: (lat: number, lon: number, label: string) => void;
  applyPreset: (key: 'ny' | 'la' | 'london' | 'joburg' | 'sydney') => void;
  retryLocationPermission: () => void;
  runFigureEight: () => void;

  toggleHaptics: () => void;
  toggleSilent: () => void;
  setPrayerDuration: (min: 5 | 10 | 15) => void;

  startSession: () => void;
  togglePause: () => void;
  endSession: () => void;
  finishSession: () => void;
  finishToJournal: () => void;
  attachVerse: (loc: VerseLoc) => void;
  detachVerse: () => void;

  saveJournalEntry: (text: string) => void;
  deleteJournalEntry: (id: number) => void;

  isSaved: (loc: VerseLoc) => boolean;
  toggleSaveVerse: (loc: VerseLoc) => void;
  removeSavedVerse: (index: number) => void;

  setReminders: (r: Reminder[]) => void;
  addReminder: () => void;
  setSnoozeMin: (min: number) => void;
  snoozeReminder: () => void;
  dismissReminder: () => void;
  testReminder: () => void;

  setMusicApp: (name: string) => void;

  openVerse: (b: number, c: number, v: number) => void;
  setScripturePosition: (b: number, c: number) => void;
  tapVerse: (v: number) => void;
  useInPrayer: () => void;

  bible: ReturnType<typeof loadBible> | null;
  votd: () => { ref: string; text: string };
};

const JerusalemContext = createContext<Ctx | null>(null);

export function useJerusalem() {
  const ctx = useContext(JerusalemContext);
  if (!ctx) throw new Error('useJerusalem must be used within JerusalemProvider');
  return ctx;
}

async function persist(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function JerusalemProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const bibleRef = useRef<ReturnType<typeof loadBible> | null>(null);
  const mountTimeRef = useRef(Date.now());
  const rawHeadingRef = useRef<number | null>(null);
  const headingAvailableRef = useRef(false);
  const alignmentCandidateSince = useRef<number | null>(null);
  const lastHapticAt = useRef<number | null>(null);
  const firedReminderKeys = useRef<Set<string>>(new Set());

  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);

  // --- restore persisted state ---
  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
        const map = Object.fromEntries(entries);
        const patchObj: Partial<State> = {};
        const showCover = map[STORAGE_KEYS.showCoverAtLaunch];
        if (showCover != null) patchObj.showCoverAtLaunch = JSON.parse(showCover);
        const journal = map[STORAGE_KEYS.journal];
        if (journal) patchObj.journal = JSON.parse(journal);
        const history = map[STORAGE_KEYS.history];
        if (history) patchObj.history = JSON.parse(history);
        const saved = map[STORAGE_KEYS.saved];
        if (saved) patchObj.savedVerses = JSON.parse(saved);
        const reminders = map[STORAGE_KEYS.reminders];
        if (reminders) patchObj.reminders = JSON.parse(reminders);
        const snoozeMin = map[STORAGE_KEYS.snoozeMin];
        if (snoozeMin) patchObj.snoozeMin = Number(snoozeMin);
        const atmosphere = map[STORAGE_KEYS.atmosphere];
        if (atmosphere) patchObj.atmosphere = JSON.parse(atmosphere);
        const haptics = map[STORAGE_KEYS.haptics];
        if (haptics != null) patchObj.hapticsEnabled = JSON.parse(haptics);
        const silent = map[STORAGE_KEYS.silent];
        if (silent != null) patchObj.silentMode = JSON.parse(silent);
        const duration = map[STORAGE_KEYS.duration];
        if (duration) patchObj.prayerDuration = Number(duration);
        const musicApp = map[STORAGE_KEYS.musicApp];
        if (musicApp) patchObj.musicApp = JSON.parse(musicApp);
        if (Object.keys(patchObj).length) patch(patchObj);
      } catch {
        // ignore
      }
    })();

    try {
      bibleRef.current = loadBible();
      patch({ bibleReady: true });
    } catch {
      // ignore
    }
  }, [patch]);

  // --- location + heading sensors ---
  useEffect(() => {
    let posSub: Location.LocationSubscription | null = null;
    let headSub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        patch({ locationPermission: status === 'denied' ? 'denied' : 'unavailable' });
        return;
      }
      patch({ locationPermission: 'granted' });

      const onPosition = (pos: Location.LocationObject) => {
        patch({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          locationSource: 'gps',
          locationAccuracyM: pos.coords.accuracy,
          locationLabel: null,
        });
      };

      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Balanced });
        if (!cancelled) onPosition(pos);
      } catch {
        // keep demo location
      }

      try {
        posSub = await Location.watchPositionAsync(
          { accuracy: Location.LocationAccuracy.Balanced, timeInterval: 4000, distanceInterval: 15 },
          onPosition,
        );
      } catch {
        // ignore
      }

      try {
        headSub = await Location.watchHeadingAsync((h) => {
          headingAvailableRef.current = true;
          const trueHeading = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          rawHeadingRef.current = normalize(trueHeading);
          patch({ headingAvailable: true, magHeading: h.magHeading });
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
      posSub?.remove();
      headSub?.remove();
    };
  }, [patch]);

  const retryLocationPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    patch({ locationPermission: status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'unavailable' });
    if (status === 'granted') {
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Balanced });
        patch({ lat: pos.coords.latitude, lon: pos.coords.longitude, locationSource: 'gps', locationAccuracyM: pos.coords.accuracy, locationLabel: null });
      } catch {
        // ignore
      }
    }
  }, [patch]);

  // --- main tick: heading smoothing + bearing/distance/alignment ---
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setState((s) => {
        const headingAvailable = headingAvailableRef.current;
        const raw = headingAvailable && rawHeadingRef.current != null
          ? rawHeadingRef.current
          : normalize(((now - mountTimeRef.current) / 45000) * 360);

        const smFactor = headingAvailable ? 0.25 : 0.08;
        const smoothed = normalize(s.smoothedHeading + smFactor * signedDelta(s.smoothedHeading, raw));
        const bearing = bearingTo(s.lat, s.lon, JERUSALEM_LAT, JERUSALEM_LON);
        const distanceKm = haversineKm(s.lat, s.lon, JERUSALEM_LAT, JERUSALEM_LON);
        const relativeAngle = signedDelta(smoothed, bearing);
        const absAngle = Math.abs(relativeAngle);

        const locConf: Confidence = s.locationSource === 'demo'
          ? 'limited'
          : s.locationAccuracyM != null && s.locationAccuracyM <= 10 ? 'high'
          : s.locationAccuracyM != null && s.locationAccuracyM <= 50 ? 'good'
          : 'limited';
        const headConf = (headingAvailable ? 'good' : 'limited') as Confidence;
        const order: Record<Confidence, number> = { unavailable: 0, limited: 1, good: 2, high: 3 };
        const overallConf = order[locConf] <= order[headConf] ? locConf : headConf;

        const thresholds = headConf === 'high' ? { enter: 3, exit: 5 } : { enter: 5, exit: 8 };
        let alignmentState = s.alignmentState;
        let candidateSince = alignmentCandidateSince.current;

        if (distanceKm < 1) {
          alignmentState = 'in-jerusalem';
          candidateSince = null;
        } else if (alignmentState === 'aligned' || alignmentState === 'in-jerusalem') {
          if (absAngle > thresholds.exit) {
            alignmentState = absAngle > 150 ? 'behind' : relativeAngle > 0 ? 'turn-right' : 'turn-left';
            candidateSince = null;
          }
        } else if (absAngle <= thresholds.enter) {
          if (!candidateSince) candidateSince = now;
          alignmentState = now - candidateSince >= 650 ? 'aligned' : 'stabilizing';
        } else {
          candidateSince = null;
          if (absAngle > 150) alignmentState = 'behind';
          else if (absAngle <= 15) alignmentState = 'almost-aligned';
          else alignmentState = relativeAngle > 0 ? 'turn-right' : 'turn-left';
        }
        alignmentCandidateSince.current = candidateSince;

        const justAligned = (alignmentState === 'aligned' || alignmentState === 'in-jerusalem') && s.alignmentState !== alignmentState;
        if (justAligned && s.hapticsEnabled && (!lastHapticAt.current || now - lastHapticAt.current > 3000)) {
          lastHapticAt.current = now;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }

        let sessionPhase = s.sessionPhase;
        let sessionAccumMs = s.sessionAccumMs;
        if (sessionPhase === 'active' && sessionAccumMs + (now - s.sessionResumedAt) >= s.prayerDuration * 60000) {
          sessionAccumMs = sessionAccumMs + (now - s.sessionResumedAt);
          sessionPhase = 'complete';
          const rec: HistoryEntry = {
            id: now, at: now, period: s.prayerDuration, minutes: Math.max(1, Math.round(sessionAccumMs / 60000)),
            planned: s.prayerDuration,
            verse: s.attachedVerse && bibleRef.current ? verseRef(bibleRef.current, s.attachedVerse) : null,
            bearing: Math.round(bearing),
          };
          const history = [rec, ...s.history];
          persist(STORAGE_KEYS.history, history);
          if (s.hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          return {
            ...s, smoothedHeading: smoothed, bearingDeg: bearing, distanceKm, relativeAngle,
            alignmentState, locConf, headConf, overallConf, lastUpdate: now,
            sessionPhase, sessionAccumMs, history,
          };
        }

        return {
          ...s, smoothedHeading: smoothed, bearingDeg: bearing, distanceKm, relativeAngle,
          alignmentState, locConf, headConf, overallConf, lastUpdate: now,
        };
      });
    }, 200);
    return () => clearInterval(id);
  }, []);

  // --- reminders: schedule OS notifications + in-app banner check ---
  useEffect(() => {
    (async () => {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        for (const r of state.reminders) {
          if (!r.on) continue;
          const [hour, minute] = r.time.split(':').map(Number);
          await Notifications.scheduleNotificationAsync({
            content: { title: `${r.label} prayer`, body: 'Face Jerusalem. Pray. Give thanks.' },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
          });
        }
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.reminders]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setState((s) => {
        if (s.snoozeUntil && Date.now() >= s.snoozeUntil) {
          return { ...s, snoozeUntil: null, reminderBanner: { label: 'Prayer' } };
        }
        const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const day = now.toDateString();
        for (const r of s.reminders) {
          const key = `${r.id}|${day}|${r.time}`;
          if (r.on && r.time === hm && !firedReminderKeys.current.has(key)) {
            firedReminderKeys.current.add(key);
            if (s.hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            return { ...s, reminderBanner: { label: r.label } };
          }
        }
        return s;
      });
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // --- actions ---
  const setAtmosphere = useCallback((a: Atmosphere) => { patch({ atmosphere: a }); persist(STORAGE_KEYS.atmosphere, a); }, [patch]);

  const toggleShowCoverAtLaunch = useCallback(() => {
    setState((s) => {
      const next = !s.showCoverAtLaunch;
      persist(STORAGE_KEYS.showCoverAtLaunch, next);
      return { ...s, showCoverAtLaunch: next };
    });
  }, []);

  const setManualLocation = useCallback((lat: number, lon: number, label: string) => {
    patch({ lat, lon, locationSource: 'manual', locationLabel: label });
  }, [patch]);

  const applyPreset = useCallback((key: 'ny' | 'la' | 'london' | 'joburg' | 'sydney') => {
    const presets = {
      ny: NEW_YORK,
      la: { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437 },
      london: { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
      joburg: { name: 'Johannesburg, ZA', lat: -26.2041, lon: 28.0473 },
      sydney: { name: 'Sydney, AU', lat: -33.8688, lon: 151.2093 },
    } as const;
    const p = presets[key];
    patch({ lat: p.lat, lon: p.lon, locationSource: 'manual', locationLabel: p.name });
  }, [patch]);

  const runFigureEight = useCallback(() => {
    patch({ calibrationStatus: 'recommended' });
    setTimeout(() => patch({ calibrationStatus: 'ready' }), 1800);
  }, [patch]);

  const toggleHaptics = useCallback(() => {
    setState((s) => { const next = !s.hapticsEnabled; persist(STORAGE_KEYS.haptics, next); return { ...s, hapticsEnabled: next }; });
  }, []);
  const toggleSilent = useCallback(() => {
    setState((s) => { const next = !s.silentMode; persist(STORAGE_KEYS.silent, next); return { ...s, silentMode: next }; });
  }, []);
  const setPrayerDuration = useCallback((min: 5 | 10 | 15) => { patch({ prayerDuration: min }); persist(STORAGE_KEYS.duration, min); }, [patch]);

  const startSession = useCallback(() => patch({ sessionPhase: 'active', sessionAccumMs: 0, sessionResumedAt: Date.now() }), [patch]);
  const togglePause = useCallback(() => {
    setState((s) => s.sessionPhase === 'active'
      ? { ...s, sessionPhase: 'paused', sessionAccumMs: s.sessionAccumMs + (Date.now() - s.sessionResumedAt) }
      : { ...s, sessionPhase: 'active', sessionResumedAt: Date.now() });
  }, []);
  const endSession = useCallback(() => {
    setState((s) => {
      const now = Date.now();
      const elapsed = s.sessionPhase === 'active' ? s.sessionAccumMs + (now - s.sessionResumedAt) : s.sessionAccumMs;
      const rec: HistoryEntry = {
        id: now, at: now, period: s.prayerDuration, minutes: Math.max(1, Math.round(elapsed / 60000)),
        planned: s.prayerDuration,
        verse: s.attachedVerse && bibleRef.current ? verseRef(bibleRef.current, s.attachedVerse) : null,
        bearing: Math.round(s.bearingDeg),
      };
      const history = [rec, ...s.history];
      persist(STORAGE_KEYS.history, history);
      if (s.hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return { ...s, sessionPhase: 'complete', sessionAccumMs: elapsed, history };
    });
  }, []);
  const finishSession = useCallback(() => patch({ sessionPhase: null, sessionAccumMs: 0 }), [patch]);
  const finishToJournal = useCallback(() => {
    patch({ sessionPhase: null, sessionAccumMs: 0 });
    router.push('/(tabs)/prayer/journal');
  }, [patch]);

  const attachVerse = useCallback((loc: VerseLoc) => { patch({ attachedVerse: loc }); router.push('/(tabs)/prayer'); }, [patch]);
  const detachVerse = useCallback(() => patch({ attachedVerse: null }), [patch]);

  const saveJournalEntry = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState((s) => {
      const journal = [{ id: Date.now(), at: Date.now(), text: trimmed }, ...s.journal];
      persist(STORAGE_KEYS.journal, journal);
      return { ...s, journal };
    });
  }, []);
  const deleteJournalEntry = useCallback((id: number) => {
    setState((s) => {
      const journal = s.journal.filter((j) => j.id !== id);
      persist(STORAGE_KEYS.journal, journal);
      return { ...s, journal };
    });
  }, []);

  const isSaved = useCallback((loc: VerseLoc) => state.savedVerses.some((x) => x.b === loc.b && x.c === loc.c && x.v === loc.v), [state.savedVerses]);
  const toggleSaveVerse = useCallback((loc: VerseLoc) => {
    setState((s) => {
      const already = s.savedVerses.some((x) => x.b === loc.b && x.c === loc.c && x.v === loc.v);
      const savedVerses = already
        ? s.savedVerses.filter((x) => !(x.b === loc.b && x.c === loc.c && x.v === loc.v))
        : [{ ...loc }, ...s.savedVerses];
      persist(STORAGE_KEYS.saved, savedVerses);
      return { ...s, savedVerses };
    });
  }, []);
  const removeSavedVerse = useCallback((index: number) => {
    setState((s) => {
      const savedVerses = s.savedVerses.filter((_, i) => i !== index);
      persist(STORAGE_KEYS.saved, savedVerses);
      return { ...s, savedVerses };
    });
  }, []);

  const setReminders = useCallback((reminders: Reminder[]) => { patch({ reminders }); persist(STORAGE_KEYS.reminders, reminders); }, [patch]);
  const addReminder = useCallback(() => {
    setState((s) => {
      const n = s.reminders.filter((r) => r.custom).length + 1;
      const reminders = [...s.reminders, { id: `c${Date.now()}`, label: `Reminder ${n}`, time: '09:00', on: true, custom: true }];
      persist(STORAGE_KEYS.reminders, reminders);
      return { ...s, reminders };
    });
  }, []);
  const setSnoozeMin = useCallback((min: number) => { patch({ snoozeMin: min }); persist(STORAGE_KEYS.snoozeMin, min); }, [patch]);
  const snoozeReminder = useCallback(() => {
    setState((s) => ({ ...s, reminderBanner: null, snoozeUntil: Date.now() + s.snoozeMin * 60000 }));
  }, []);
  const dismissReminder = useCallback(() => patch({ reminderBanner: null }), [patch]);
  const testReminder = useCallback(() => patch({ reminderBanner: { label: 'Time for prayer' } }), [patch]);

  const setMusicApp = useCallback((name: string) => { patch({ musicApp: name }); persist(STORAGE_KEYS.musicApp, name); }, [patch]);

  const setScripturePosition = useCallback((b: number, c: number) => patch({ scrBook: b, scrChapter: c, scrVerse: null }), [patch]);
  const openVerse = useCallback((b: number, c: number, v: number) => {
    patch({ scrBook: b, scrChapter: c, scrVerse: v });
    router.push('/(tabs)/scripture');
  }, [patch]);
  const tapVerse = useCallback((v: number) => {
    setState((s) => ({ ...s, scrVerse: s.scrVerse === v ? null : v }));
  }, []);
  const useInPrayer = useCallback(() => {
    setState((s) => {
      const loc = s.scrVerse != null ? { b: s.scrBook, c: s.scrChapter, v: s.scrVerse } : { b: 26, c: 5, v: 9 };
      return { ...s, attachedVerse: loc };
    });
    router.push('/(tabs)/prayer');
  }, []);

  const votd = useCallback(() => {
    const now = new Date();
    const doy = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const all = [
      ['Daniel', 6, 10], ['Psalms', 122, 6], ['Psalms', 137, 5], ['Psalms', 125, 2], ['Psalms', 51, 18],
      ['Isaiah', 62, 6], ['Isaiah', 40, 2], ['1 Kings', 8, 48], ['Daniel', 9, 16], ['Zechariah', 8, 3],
      ['Matthew', 6, 6], ['Philippians', 4, 6], ['1 Thessalonians', 5, 17], ['James', 5, 16], ['Jeremiah', 29, 12],
      ['Psalms', 5, 3], ['Psalms', 55, 17], ['Mark', 11, 24], ['Romans', 12, 12], ['2 Chronicles', 7, 14],
      ['Psalms', 100, 4], ['Psalms', 107, 1], ['Psalms', 136, 1], ['Psalms', 95, 2], ['Psalms', 92, 1],
      ['1 Chronicles', 16, 34], ['1 Thessalonians', 5, 18], ['Colossians', 4, 2], ['Ephesians', 5, 20], ['Hebrews', 13, 15],
    ] as const;
    const [name, c, v] = all[doy % all.length];
    const bible = bibleRef.current;
    const b = bible ? bible.findIndex((x) => x.n === name) : -1;
    return { ref: `${name} ${c}:${v}`, text: b >= 0 && bible ? bible[b].c[c - 1][v - 1] : '' };
  }, []);

  const theme = THEMES[state.atmosphere];
  const isAligned = state.alignmentState === 'aligned' || state.alignmentState === 'in-jerusalem';
  const alignmentLabel = ALIGNMENT_TEXT[state.alignmentState];

  const value = useMemo<Ctx>(() => ({
    ...state,
    theme,
    isAligned,
    alignmentLabel,
    bible: bibleRef.current,
    setAtmosphere,
    toggleShowCoverAtLaunch,
    setManualLocation,
    applyPreset,
    retryLocationPermission,
    runFigureEight,
    toggleHaptics,
    toggleSilent,
    setPrayerDuration,
    startSession,
    togglePause,
    endSession,
    finishSession,
    finishToJournal,
    attachVerse,
    detachVerse,
    saveJournalEntry,
    deleteJournalEntry,
    isSaved,
    toggleSaveVerse,
    removeSavedVerse,
    setReminders,
    addReminder,
    setSnoozeMin,
    snoozeReminder,
    dismissReminder,
    testReminder,
    setMusicApp,
    openVerse,
    setScripturePosition,
    tapVerse,
    useInPrayer,
    votd,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state, theme, isAligned, alignmentLabel]);

  return <JerusalemContext.Provider value={value}>{children}</JerusalemContext.Provider>;
}

export { formatDistance, verseRef, verseText };
