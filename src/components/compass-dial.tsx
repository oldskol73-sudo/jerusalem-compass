import React, { useEffect } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useJerusalem } from '@/state/jerusalem-store';

// The compass is built from three layers, like a real one:
//  - outer ring (bezel, ticks, degree numbers, N/E/S/W): turns opposite to the heading,
//    so N always points at true north
//  - inner dial (the city): stays put
//  - needle (the star): points at Jerusalem, so its tip lands on Jerusalem's bearing on the ring
const OUTER_RING = require('@/assets/images/app/compass-outer-ring.png');
const INNER_DIAL = require('@/assets/images/app/compass-inner-dial.png');
const NEEDLE = require('@/assets/images/app/compass-needle.png');

// The needle artwork spans this fraction of the whole compass, matching the inner dial's opening.
const NEEDLE_SCALE = 0.625;

function useSmoothRotation(deg: number) {
  const value = useSharedValue(deg);
  useEffect(() => {
    // Take the shortest path so nothing spins the long way around.
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
  const { width } = useWindowDimensions();
  const size = Math.round(Math.min(width - 40, 340));
  const needleSize = Math.round(size * NEEDLE_SCALE);

  const ringRotation = useSmoothRotation(-smoothedHeading);
  const needleRotation = useSmoothRotation(bearingDeg - smoothedHeading);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${ringRotation.value}deg` }] }));
  const needleStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${needleRotation.value}deg` }] }));

  const markerW = size * 0.03;

  return (
    <View style={styles.container}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          boxShadow: isAligned ? `0 0 34px ${theme.gold}` : undefined,
        }}>
        <Animated.View style={[{ position: 'absolute', width: size, height: size }, ringStyle]}>
          <Image source={OUTER_RING} style={{ width: size, height: size }} resizeMode="contain" />
        </Animated.View>

        <Image source={INNER_DIAL} style={{ position: 'absolute', width: size, height: size }} resizeMode="contain" />

        <Animated.View
          style={[
            {
              position: 'absolute',
              top: (size - needleSize) / 2,
              left: (size - needleSize) / 2,
              width: needleSize,
              height: needleSize,
              filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.55))',
            } as object,
            needleStyle,
          ]}>
          <Image source={NEEDLE} style={{ width: needleSize, height: needleSize }} resizeMode="contain" />
        </Animated.View>

        {/* fixed marker at the top: when the needle points up at it, you are facing Jerusalem */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.06,
            left: size / 2 - markerW,
            width: 0,
            height: 0,
            borderLeftWidth: markerW,
            borderRightWidth: markerW,
            borderTopWidth: markerW * 1.7,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: isAligned ? theme.gold : '#f6d98a',
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
});
