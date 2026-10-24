import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { CompassDial } from '@/components/compass-dial';

const SIZE = 150;

/** Home-screen preview: the same layered compass as the Compass tab, tap to open it. */
export function MiniCompassBadge() {
  return (
    <Pressable onPress={() => router.push('/(tabs)/compass')} style={styles.wrap} accessibilityRole="button" accessibilityLabel="Open compass">
      <CompassDial size={SIZE} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
