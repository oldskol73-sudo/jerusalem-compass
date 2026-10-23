import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useJerusalem } from '@/state/jerusalem-store';

const SIZE = 240;
const STROKE = 3;
const R = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function PrayerRing({ progress, children }: { progress: number; children: React.ReactNode }) {
  const { theme } = useJerusalem();
  const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={theme.border} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={theme.accent}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 6 },
});
