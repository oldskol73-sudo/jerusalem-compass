import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

  const ticks = [];
  for (let d = 0; d < 360; d += 10) {
    const major = d % 30 === 0;
    ticks.push(
      <View key={d} style={[styles.tickWrap, { transform: [{ rotate: `${d}deg` }] }]}>
        <View
          style={[
            styles.tick,
            {
              height: major ? 16 : 8,
              backgroundColor: d === 0 ? theme.gold : theme.brassring,
              opacity: major ? 0.95 : 0.5,
            },
          ]}
        />
        {major && (
          <View style={[styles.tickLabelWrap, { transform: [{ rotate: `${-d}deg` }] }]}>
            <Text style={[styles.tickLabel, { color: theme.dialtext }]}>{d}</Text>
          </View>
        )}
      </View>,
    );
  }

  const cardinals = ['N', 'E', 'S', 'W'].map((label, i) => {
    const d = i * 90;
    return (
      <View key={label} style={[styles.tickWrap, { transform: [{ rotate: `${d}deg` }] }]}>
        <View style={[styles.cardinalLabelWrap, { transform: [{ rotate: `${-d}deg` }] }]}>
          <Text style={[styles.cardinalLabel, { color: d === 0 ? theme.gold : theme.dialtext }]}>{label}</Text>
        </View>
      </View>
    );
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.glow,
          isAligned ? { shadowColor: theme.gold, shadowOpacity: 0.9, shadowRadius: 34, elevation: 12 } : null,
        ]}>
        <Animated.View style={[styles.dial, { borderColor: theme.brassring }, dialStyle]}>
          <LinearGradient
            colors={[theme.dialhi, theme.dialbase]}
            start={{ x: 0.3, y: 0.2 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {ticks}
          {cardinals}
          <Animated.View style={[styles.jerusalemMarkerWrap, markerStyle]}>
            <View style={[styles.jerusalemMarker, { backgroundColor: theme.gold, shadowColor: theme.gold }]} />
          </Animated.View>
        </Animated.View>
        <View style={styles.crosshair} pointerEvents="none">
          <View style={[styles.crosshairLineH, { backgroundColor: theme.border }]} />
          <View style={[styles.crosshairLineV, { backgroundColor: theme.border }]} />
        </View>
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
  tickWrap: { position: 'absolute', inset: 0 } as object,
  tick: { position: 'absolute', top: 8, left: RADIUS - 1, width: 2, borderRadius: 1 },
  tickLabelWrap: { position: 'absolute', top: 30, left: RADIUS - 14, width: 28, alignItems: 'center' },
  tickLabel: { fontSize: 11, fontWeight: '600', opacity: 0.65 },
  cardinalLabelWrap: { position: 'absolute', top: 58, left: RADIUS - 16, width: 32, alignItems: 'center' },
  cardinalLabel: { fontSize: 22, fontWeight: '800' },
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
  crosshair: { position: 'absolute', width: SIZE, height: SIZE },
  crosshairLineH: { position: 'absolute', top: RADIUS, left: SIZE * 0.16, right: SIZE * 0.16, height: 1 },
  crosshairLineV: { position: 'absolute', left: RADIUS, top: SIZE * 0.16, bottom: SIZE * 0.16, width: 1 },
  needleStem: {
    position: 'absolute', top: 6, left: RADIUS - 1.5, width: 3, height: 20, borderRadius: 2,
    shadowOpacity: 0.9, shadowRadius: 8,
  },
  needleHub: { position: 'absolute', top: RADIUS - 5, left: RADIUS - 5, width: 10, height: 10, borderRadius: 5 },
});
