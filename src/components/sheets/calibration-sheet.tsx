import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

const STEPS = [
  'Move away from metal objects',
  'Move away from speakers',
  'Avoid appliances and vehicles',
  'Remove magnetic phone mounts where practical',
  'Move the device through a slow figure-eight',
  'Rotate through portrait and landscape positions',
  'Hold the device level for better accuracy',
];

export function CalibrationSheet({ onClose }: { onClose: () => void }) {
  const { theme, calibrationStatus, runFigureEight } = useJerusalem();
  const statusLabel = calibrationStatus === 'ready' ? 'Compass ready'
    : calibrationStatus === 'recommended' ? 'Calibration recommended'
    : 'Accuracy improving';

  return (
    <View style={{ gap: 12 }}>
      <Text style={[styles.title, { color: theme.text }]}>Compass calibration</Text>
      <Text style={{ color: theme.gold, fontWeight: '600', fontSize: 13 }}>{statusLabel}</Text>
      <View style={{ gap: 8 }}>
        {STEPS.map((s) => (
          <Text key={s} style={{ color: theme.text, fontSize: 13, lineHeight: 19 }}>• {s}</Text>
        ))}
      </View>
      <Pressable
        style={[styles.submit, { backgroundColor: theme.accent }]}
        onPress={() => { runFigureEight(); setTimeout(onClose, 500); }}>
        <Text style={{ color: theme.onaccent, fontWeight: '700', fontSize: 14 }}>I&rsquo;ve completed the figure-eight</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.sansBold, fontSize: 16 },
  submit: { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
});
