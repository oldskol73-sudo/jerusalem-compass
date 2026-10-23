import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useJerusalem } from '@/state/jerusalem-store';

const SIZE = 250;
const RADIUS = SIZE / 2;

// Needle palette sampled from the dial artwork: lit/shaded faces of a gold arm and a steel tail.
const GOLD = ['#f6d98a', '#b48a32'] as const;
const STEEL = ['#b9b6ab', '#625f57'] as const;

function useSmoothRotation(deg: number) {
  const value = useSharedValue(deg);
  useEffect(() => {
    // Take the shortest path so the needle never spins the long way around.
    const current = value.value % 360;
    let target = deg;
    const diff = ((target - current + 540) % 360) - 180;
    target = current + diff;
    value.value = withTiming(target, { duration: 220, easing: Easing.linear });
  }, [deg, value]);
  return value;
}

type HalfTriProps = { dir: 'up' | 'down'; side: 'left' | 'right'; w: number; h: number; color: string };

/** One half of a thin isosceles triangle anchored at the dial center, built from borders. */
function HalfTri({ dir, side, w, h, color }: HalfTriProps) {
  const isRight = side === 'right';
  return (
    <View
      style={{
        position: 'absolute',
        left: isRight ? RADIUS : RADIUS - w,
        top: dir === 'up' ? RADIUS - h : RADIUS,
        width: 0,
        height: 0,
        borderLeftWidth: isRight ? 0 : w,
        borderRightWidth: isRight ? w : 0,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        ...(dir === 'up'
          ? { borderBottomWidth: h, borderBottomColor: color }
          : { borderTopWidth: h, borderTopColor: color }),
      }}
    />
  );
}

/**
 * Full compass-badge artwork held still, with a gold pointer arm and steel tail. The arm swings
 * to point at Jerusalem relative to where the device is facing; straight up (under the badge's
 * top pointer) means the device is facing Jerusalem.
 */
export function CompassDial() {
  const { smoothedHeading, bearingDeg, theme, isAligned } = useJerusalem();

  const needleRotation = useSmoothRotation(bearingDeg - smoothedHeading);
  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${needleRotation.value}deg` }],
  }));

  // The badge's glass face is smaller than the old full-bleed dial, so the needle is shorter.
  const w = SIZE * 0.024;
  const armH = SIZE * 0.34;
  const tailH = SIZE * 0.31;
  const hub = SIZE * 0.07;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.glow,
          isAligned ? { shadowColor: theme.gold, shadowOpacity: 0.9, shadowRadius: 34, elevation: 12 } : null,
        ]}>
        <View style={styles.dial}>
          <Image
            source={require('@/assets/images/app/compass-badge-dial.png')}
            style={styles.dialImage}
            resizeMode="contain"
          />
          <Animated.View style={[styles.fill, needleStyle]}>
            <View style={styles.needleShadow}>
              <HalfTri dir="down" side="left" w={w} h={tailH} color={STEEL[0]} />
              <HalfTri dir="down" side="right" w={w} h={tailH} color={STEEL[1]} />
              <HalfTri dir="up" side="left" w={w} h={armH} color={GOLD[0]} />
              <HalfTri dir="up" side="right" w={w} h={armH} color={GOLD[1]} />
            </View>
          </Animated.View>
          <View
            style={[
              styles.hub,
              { left: RADIUS - hub / 2, top: RADIUS - hub / 2, width: hub, height: hub, borderRadius: hub / 2 },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  glow: { width: SIZE, height: SIZE, borderRadius: RADIUS, alignItems: 'center', justifyContent: 'center' },
  dial: { width: SIZE, height: SIZE, position: 'absolute' },
  dialImage: { width: SIZE, height: SIZE, position: 'absolute', top: 0, left: 0 },
  fill: { position: 'absolute', top: 0, left: 0, width: SIZE, height: SIZE },
  needleShadow: {
    position: 'absolute', top: 0, left: 0, width: SIZE, height: SIZE,
    filter: 'drop-shadow(2px 4px 3px rgba(0,0,0,0.5))',
  } as object,
  hub: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#8c6a26',
    backgroundColor: '#d9b45f',
    boxShadow: '0 1px 3px rgba(0,0,0,0.6)',
  } as object,
});
