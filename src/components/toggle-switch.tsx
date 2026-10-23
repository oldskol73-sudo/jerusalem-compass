import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useJerusalem } from '@/state/jerusalem-store';

export function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const { theme } = useJerusalem();
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.track, { backgroundColor: on ? theme.accent : theme.border }]}>
      <View style={[styles.thumb, { left: on ? 21 : 3 }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 14,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    top: 3,
  },
});
