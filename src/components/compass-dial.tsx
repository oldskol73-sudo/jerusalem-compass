import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useJerusalem } from '@/state/jerusalem-store';

const SIZE = 250;
const RADIUS = SIZE / 2;

function useSmoothRotation(deg: number) {
  const value = useSharedValue(deg);
  useEffect(() => {
    // Take the shortest path so the dial never spins the long way around.
    const current = value.value % 360;
    let target = deg;
    const diff = ((target - current + 540) % 360) - 180;
    target = current + diff;
    value.value = withTiming(target, { duration: 220, easing: Easing.linear });
  }, [deg, value]);
  return value;
}

export function CompassDial() {
  const { smoothedHeading, bearingDeg, theme, isAligned } = useJerusalem();

  const dialRotation = useSmoothRotation(-smoothedHeading);
  const jerusalemRotation = useSmoothRotation(bearingDeg);

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialRotation.value}deg` }],
  }));
  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${jerusalemRotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.glow,
          isAligned ? { shadowColor: theme.gold, shadowOpacity: 0.9, shadowRadius: 34, elevation: 12 } : null,
        ]}>
        <Animated.View style={[styles.dial, { borderColor: theme.brassring }, dialStyle]}>
          <Image
            source={require('@/assets/images/app/compass-dial-bg.jpg')}
            style={styles.dialImage}
            resizeMode="cover"
          />
          <Animated.View style={[styles.jerusalemMarkerWrap, markerStyle]}>
            <View style={[styles.jerusalemMarker, { backgroundColor: theme.gold, shadowColor: theme.gold }]} />
          </Animated.View>
        </Animated.View>
        <View style={[styles.needleStem, { backgroundColor: isAligned ? theme.gold : theme.needle, shadowColor: theme.glow }]} />
        <View style={[styles.needleHub, { backgroundColor: isAligned ? theme.gold : theme.needle }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  glow: { width: SIZE, height: SIZE, borderRadius: RADIUS, alignItems: 'center', justifyContent: 'center' },
  dial: {
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'absolute',
  },
  dialImage: { width: SIZE, height: SIZE, position: 'absolute', top: 0, left: 0 },
  jerusalemMarkerWrap: { position: 'absolute', inset: 0 } as object,
  jerusalemMarker: {
    position: 'absolute',
    top: 20,
    left: RADIUS - 7,
    width: 14,
    height: 14,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  needleStem: {
    position: 'absolute', top: 6, left: RADIUS - 1.5, width: 3, height: 20, borderRadius: 2,
    shadowOpacity: 0.9, shadowRadius: 8,
  },
  needleHub: { position: 'absolute', top: RADIUS - 5, left: RADIUS - 5, width: 10, height: 10, borderRadius: 5 },
});
