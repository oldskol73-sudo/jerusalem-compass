import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompassDial } from '@/components/compass-dial';
import { FONTS } from '@/constants/fonts';
import { formatDistance } from '@/constants/jerusalem';
import { useJerusalem } from '@/state/jerusalem-store';

function Star({ left, top, size, delay }: { left: number; top: number; size: number; delay: number }) {
  const opacity = useSharedValue(0.15);
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 2200 }), withTiming(0.15, { duration: 2200 })), -1, true),
    );
  }, [opacity, delay]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        styles.star,
        { left: `${left}%`, top: `${top}%`, width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

export default function CoverScreen() {
  const { showCoverAtLaunch, bearingDeg, distanceKm, locationLabel } = useJerusalem();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!showCoverAtLaunch) router.replace('/(tabs)');
  }, [showCoverAtLaunch]);

  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        let seed = i * 97 + 13;
        const rnd = () => {
          seed = (seed * 16807) % 2147483647;
          return seed / 2147483647;
        };
        return {
          key: i,
          left: rnd() * 100,
          top: rnd() * 62,
          size: rnd() < 0.15 ? 2.5 : 1.4,
          delay: rnd() * 2500,
        };
      }),
    [],
  );

  const shimmer = useSharedValue(-1);
  useEffect(() => {
    shimmer.value = withRepeat(withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }), withTiming(-1, { duration: 0 })), -1, false);
  }, [shimmer]);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * 160 }, { skewX: '-20deg' }],
  }));

  if (!showCoverAtLaunch) return null;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1b2545', '#0b1022', '#05070f']} style={StyleSheet.absoluteFill} />
      {stars.map((s) => (
        <Star key={s.key} left={s.left} top={s.top} size={s.size} delay={s.delay} />
      ))}

      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandLine} />
          <Text style={styles.brandText}>Twelve Scents Publishing</Text>
          <View style={styles.brandLine} />
        </View>

        <View style={styles.dialWrap}>
          <View style={styles.dialGlow} />
          <View style={{ transform: [{ scale: 0.86 }] }}>
            <CompassDial />
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>FACE{'\n'}JERUSALEM</Text>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDiamond} />
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.quote}>&ldquo;his windows being open in his chamber toward Jerusalem&rdquo;</Text>
          <Text style={styles.ref}>Daniel 6:10</Text>
          <Text style={styles.sub}>
            {formatDistance(distanceKm)} from {locationLabel ?? 'your location'} · bearing {Math.round(bearingDeg)}°
          </Text>

          <Pressable style={styles.cta} onPress={() => router.replace('/(tabs)')}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
            <Text style={styles.ctaText}>ENTER FACE JERUSALEM</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070f' },
  star: { position: 'absolute', backgroundColor: '#fff6dc' },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandLine: { width: 22, height: 1, backgroundColor: '#c9a24a' },
  brandText: { fontSize: 10, letterSpacing: 2.6, textTransform: 'uppercase', color: '#d9b866', fontWeight: '700' },
  dialWrap: { alignItems: 'center', justifyContent: 'center' },
  dialGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(240,196,92,.22)',
  },
  titleBlock: { alignItems: 'center', gap: 14, width: '100%' },
  title: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: 2,
    textAlign: 'center',
    color: '#e8c163',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 220 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#c9a24a' },
  dividerDiamond: { width: 7, height: 7, backgroundColor: '#e6c46c', transform: [{ rotate: '45deg' }] },
  quote: {
    fontFamily: FONTS.serifItalic,
    fontSize: 16,
    lineHeight: 24,
    color: '#efe3c4',
    textAlign: 'center',
    maxWidth: 290,
  },
  ref: { fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: '#d9b866', fontWeight: '700' },
  sub: { fontSize: 12, color: 'rgba(239,227,196,0.7)', textAlign: 'center' },
  cta: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    marginTop: 10,
    backgroundColor: '#dcac44',
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -40,
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  ctaText: { color: '#1d1406', fontWeight: '800', fontSize: 14, letterSpacing: 2 },
});
