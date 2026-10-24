import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/app-text';

export const GOLD = '#e8c163';
export const GOLD_SOFT = '#d9b866';
export const GOLD_LIGHT = '#f2d488';
export const CREAM = '#efe3c4';

/** Opens the app from the launch cover; from a Settings preview it just closes the preview. */
export function enterApp() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}

/** Small twinkling star. */
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
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#fff6dc',
          boxShadow: `0 0 ${size * 3}px rgba(255,236,180,0.8)`,
        } as object,
        style,
      ]}
    />
  );
}

/** A field of twinkling stars (seeded, so the layout is stable). */
export function Stars({ count = 46, maxTop = 70 }: { count?: number; maxTop?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        let seed = i * 97 + 13;
        const rnd = () => {
          seed = (seed * 16807) % 2147483647;
          return seed / 2147483647;
        };
        return {
          key: i,
          left: rnd() * 100,
          top: rnd() * maxTop,
          size: rnd() < 0.15 ? 2.5 : 1.4,
          delay: rnd() * 2500,
        };
      }),
    [count, maxTop],
  );
  return (
    <>
      {stars.map((s) => (
        <Star key={s.key} left={s.left} top={s.top} size={s.size} delay={s.delay} />
      ))}
    </>
  );
}

/** "TWELVE SCENTS PUBLISHING"; `lines` adds the gold rules either side. */
export function BrandRow({ lines = true }: { lines?: boolean }) {
  return (
    <View style={styles.brandRow}>
      {lines && <View style={styles.brandLine} />}
      <Text style={styles.brandText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Twelve Scents Publishing</Text>
      {lines && <View style={styles.brandLine} />}
    </View>
  );
}

/** Gold rule with a diamond in the middle. */
export function DiamondDivider({ width = 220 }: { width?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width }}>
      <LinearGradient colors={['transparent', '#c9a24a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.rule} />
      <View style={styles.diamond} />
      <LinearGradient colors={['#c9a24a', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.rule} />
    </View>
  );
}

/** The FIND JERUSALEM button. `pill` and `rect` are filled gold; `outline` is a glowing gold outline. */
export function FindButton({ variant }: { variant: 'pill' | 'rect' | 'outline' }) {
  const shimmer = useSharedValue(-1);
  useEffect(() => {
    if (variant !== 'pill') return;
    shimmer.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }), withTiming(-1, { duration: 0 })),
      -1,
      false,
    );
  }, [shimmer, variant]);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * 160 }, { skewX: '-20deg' }],
  }));

  if (variant === 'outline') {
    return (
      <Pressable accessibilityRole="button" onPress={enterApp} style={styles.outlineBtn}>
        <Text style={[styles.btnText, { color: GOLD_LIGHT }]}>FIND JERUSALEM</Text>
      </Pressable>
    );
  }

  const radius = variant === 'pill' ? 999 : 14;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={enterApp}
      style={{ width: '100%', borderRadius: radius, overflow: 'hidden', boxShadow: '0 8px 28px rgba(232,186,84,0.32)' } as object}>
      <LinearGradient colors={['#f2d488', '#c79a3a']} style={{ paddingVertical: 17, alignItems: 'center' }}>
        {variant === 'pill' && <Animated.View style={[styles.shimmer, shimmerStyle]} />}
        <Text style={[styles.btnText, { color: '#1d1406' }]}>FIND JERUSALEM</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '100%' },
  brandLine: { width: 20, height: 1, backgroundColor: '#c9a24a' },
  brandText: { flexShrink: 1, fontSize: 10, letterSpacing: 2.6, textTransform: 'uppercase', color: GOLD_SOFT, fontWeight: '700' },
  rule: { flex: 1, height: 1 },
  diamond: { width: 7, height: 7, backgroundColor: '#e6c46c', transform: [{ rotate: '45deg' }] },
  shimmer: { position: 'absolute', top: 0, bottom: 0, left: -40, width: '30%', backgroundColor: 'rgba(255,255,255,0.35)' },
  btnText: { fontWeight: '800', fontSize: 14, letterSpacing: 2 },
  outlineBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: GOLD_SOFT,
    boxShadow: 'inset 0 0 22px rgba(232,186,84,0.18), 0 0 24px rgba(232,186,84,0.2)',
  } as object,
});
