import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { BearingCover } from '@/components/covers/bearing-cover';
import { NightSkyCover } from '@/components/covers/night-sky-cover';
import { OpenWindowCover } from '@/components/covers/open-window-cover';
import { useJerusalem } from '@/state/jerusalem-store';

const COVERS = [NightSkyCover, OpenWindowCover, BearingCover];
const LAST_COVER_KEY = 'fj_lastCover';

/** Picks one of the three covers at random on each launch, never the same one twice in a row. */
export default function CoverScreen() {
  const { showCoverAtLaunch } = useJerusalem();
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!showCoverAtLaunch) router.replace('/(tabs)');
  }, [showCoverAtLaunch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let last = -1;
      try {
        const stored = await AsyncStorage.getItem(LAST_COVER_KEY);
        if (stored != null) last = Number(stored);
      } catch {
        // fall back to a plain random pick
      }
      const choices = COVERS.map((_, i) => i).filter((i) => i !== last);
      const pick = choices[Math.floor(Math.random() * choices.length)];
      if (!cancelled) setIndex(pick);
      try {
        await AsyncStorage.setItem(LAST_COVER_KEY, String(pick));
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!showCoverAtLaunch) return null;
  if (index == null) return <View style={{ flex: 1, backgroundColor: '#05070f' }} />;

  const Cover = COVERS[index];
  return <Cover />;
}
