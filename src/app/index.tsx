import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
  const { height } = useWindowDimensions();
  // Size the portrait to the screen so the title and Enter button stay on screen.
  const portraitH = Math.max(170, Math.min(290, height * 0.3));
  const portraitW = Math.round(portraitH * 0.793);

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

      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View style={styles.brandLine} />
          <Image source={require('@/assets/images/app/tsp-mark.png')} style={styles.brandMark} resizeMode="contain" />
          <Text style={styles.brandText} numberOfLines={1} maxFontSizeMultiplier={1.1}>Twelve Scents Publishing</Text>
          <View style={styles.brandLine} />
        </View>

        <View style={styles.dialWrap}>
          <View style={[styles.dialGlow, { width: portraitW + 70, height: portraitH + 10 }]} />
          <View style={[styles.portraitFrame, { width: portraitW, height: portraitH }]}>
            <Image source={require('@/assets/images/app/cover-daniel.jpg')} style={styles.portrait} resizeMode="cover" />
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>FACE{'\n'}JERUSALEM</Text>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDiamond} />
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.quote} maxFontSizeMultiplier={1.2}>&ldquo;his windows being open in his chamber toward Jerusalem&rdquo;</Text>
          <Text style={styles.ref} maxFontSizeMultiplier={1.2}>Daniel 6:10</Text>
          <Text style={styles.sub} maxFontSizeMultiplier={1.2}>
            {formatDistance(distanceKm)} from {locationLabel ?? 'your location'} · bearing {Math.round(bearingDeg)}°
          </Text>

          <Pressable style={styles.cta} onPress={() => router.replace('/(tabs)')}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
            <Text style={styles.ctaText} maxFontSizeMultiplier={1.2}>FIND JERUSALEM</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070f' },
  star: { position: 'absolute', backgroundColor: '#fff6dc' },
  content: {
    flexGrow: 1,
    gap: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLine: { width: 18, height: 1, backgroundColor: '#c9a24a' },
  brandMark: { width: 16, height: 17 },
  brandText: { flexShrink: 1, fontSize: 10, letterSpacing: 2.6, textTransform: 'uppercase', color: '#d9b866', fontWeight: '700' },
  dialWrap: { alignItems: 'center', justifyContent: 'center' },
  dialGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 24,
    backgroundColor: 'rgba(240,196,92,.22)',
  },
  portraitFrame: {
    width: 230,
    height: 290,
    borderRadius: 14,
    padding: 4,
    backgroundColor: '#d9b866',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  portrait: { width: '100%', height: '100%', borderRadius: 11 },
  titleBlock: { alignItems: 'center', gap: 14, width: '100%' },
  title: { alignSelf: 'stretch', alignItems: 'center' },
  titleLine: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 2,
    textAlign: 'center',
    color: '#e8c163',
    maxWidth: '100%',
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
