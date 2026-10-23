import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useJerusalem } from '@/state/jerusalem-store';

const SIZE = 118;
const RADIUS = SIZE / 2;

export function MiniCompassBadge() {
  const { relativeAngle, theme, isAligned } = useJerusalem();
  const rotation = useSharedValue(relativeAngle);

  React.useEffect(() => {
    const current = rotation.value % 360;
    const diff = ((relativeAngle - current + 540) % 360) - 180;
    rotation.value = withTiming(current + diff, { duration: 220, easing: Easing.linear });
  }, [relativeAngle, rotation]);

  const markerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <Pressable onPress={() => router.push('/(tabs)/compass')} style={styles.wrap} accessibilityRole="button" accessibilityLabel="Open compass">
      <View style={[styles.circle, isAligned ? { shadowColor: theme.gold, shadowOpacity: 0.9, shadowRadius: 18, elevation: 8 } : null]}>
        <LinearGradient
          colors={[theme.dialhi, theme.dialbase]}
          start={{ x: 0.3, y: 0.2 }}
          end={{ x: 0.8, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: RADIUS }]}
        />
        <Animated.View style={[styles.markerWrap, markerStyle]}>
          <View style={[styles.marker, { backgroundColor: theme.gold, shadowColor: theme.gold }]} />
        </Animated.View>
        <View style={[styles.frontArrow, { borderBottomColor: theme.accent }]} />
        <View style={[styles.hub, { backgroundColor: theme.accent }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS,
    overflow: 'hidden',
  },
  markerWrap: { position: 'absolute', inset: 0 } as object,
  marker: {
    position: 'absolute', top: 6, left: RADIUS - 4.5, width: 9, height: 9, borderRadius: 2,
    transform: [{ rotate: '45deg' }], shadowOpacity: 0.9, shadowRadius: 6,
  },
  frontArrow: {
    position: 'absolute', top: 8, left: RADIUS - 6, width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 15,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  hub: { position: 'absolute', top: RADIUS - 4, left: RADIUS - 4, width: 8, height: 8, borderRadius: 4 },
});
