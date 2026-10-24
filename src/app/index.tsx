import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { COVER_STYLE_KEY, COVERS, isCoverStyle, LAST_COVER_KEY } from '@/components/covers/registry';
import { useJerusalem } from '@/state/jerusalem-store';

/** Opens with the chosen cover, or a random one (never the same twice in a row) when set to random. */
export default function CoverScreen() {
  const { showCoverAtLaunch } = useJerusalem();
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!showCoverAtLaunch) router.replace('/(tabs)');
  }, [showCoverAtLaunch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let style: string | null = null;
      let last = -1;
      try {
        style = await AsyncStorage.getItem(COVER_STYLE_KEY);
        const stored = await AsyncStorage.getItem(LAST_COVER_KEY);
        if (stored != null) last = Number(stored);
      } catch {
        // fall back to a plain random pick
      }

      const fixed = isCoverStyle(style) && style !== 'random' ? COVERS.findIndex((c) => c.key === style) : -1;
      let pick = fixed;
      if (pick < 0) {
        const choices = COVERS.map((_, i) => i).filter((i) => i !== last);
        pick = choices[Math.floor(Math.random() * choices.length)];
      }
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

  const { Component } = COVERS[index];
  return <Component />;
}
