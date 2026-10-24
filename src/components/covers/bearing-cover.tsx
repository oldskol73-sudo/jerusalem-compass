import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/app-text';
import { CompassDial } from '@/components/compass-dial';
import { CREAM, FindButton, GOLD_LIGHT } from '@/components/covers/cover-parts';
import { FONTS } from '@/constants/fonts';
import { compassPointFor, formatDistance } from '@/constants/jerusalem';
import { useJerusalem } from '@/state/jerusalem-store';

/** Cover 3: the live compass with the bearing and distance to Jerusalem in large type. */
export function BearingCover() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { bearingDeg, distanceKm, locationLabel } = useJerusalem();
  const size = Math.round(Math.max(190, Math.min(270, height * 0.31)));

  return (
    <View style={styles.root}>
      <View style={styles.glow} pointerEvents="none" />

      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(800)} style={{ alignItems: 'center', gap: 6 }}>
          <Text style={styles.wordmark} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1.1}>FACE JERUSALEM</Text>
          <Text style={styles.brand} numberOfLines={1}>Twelve Scents Publishing</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(100)} style={{ width: size + 60, height: size + 60, alignItems: 'center', justifyContent: 'center' }}>
          <View style={[styles.ring, { width: size + 28, height: size + 28, borderRadius: size, borderColor: 'rgba(217,184,102,0.35)' }]} />
          <View style={[styles.ring, { width: size + 60, height: size + 60, borderRadius: size, borderColor: 'rgba(217,184,102,0.15)' }]} />
          <CompassDial size={size} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(300)} style={{ alignItems: 'center', gap: 4 }}>
          <Text style={styles.bearing} maxFontSizeMultiplier={1.1}>{Math.round(bearingDeg)}°</Text>
          <Text style={styles.detail} numberOfLines={2}>
            {compassPointFor(bearingDeg)} · {formatDistance(distanceKm)}
          </Text>
          <Text style={styles.from}>Jerusalem from {locationLabel ?? 'your location'}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(450)} style={{ alignItems: 'center', gap: 10, width: '100%' }}>
          <Text style={styles.quote}>&ldquo;toward Jerusalem&rdquo; · Daniel 6:10</Text>
          <FindButton variant="rect" />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0b09' },
  glow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    experimental_backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(232,186,84,0.22), rgba(232,186,84,0) 55%)',
  } as object,
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', gap: 14, paddingHorizontal: 28 },
  wordmark: { fontFamily: FONTS.serifSemiBold, fontSize: 24, letterSpacing: 5, color: GOLD_LIGHT, maxWidth: '100%' },
  brand: { fontSize: 10, letterSpacing: 2.8, textTransform: 'uppercase', color: '#a08a5c', fontWeight: '700' },
  ring: { position: 'absolute', borderWidth: 1 },
  bearing: { fontFamily: FONTS.serifSemiBold, fontSize: 58, lineHeight: 62, color: '#fbe7a6' },
  detail: { fontSize: 13, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase', color: '#d9b866', textAlign: 'center' },
  from: { fontSize: 12, color: '#a08a5c', marginTop: 2, textAlign: 'center' },
  quote: { fontFamily: FONTS.serifItalic, fontSize: 15, lineHeight: 22, color: CREAM, textAlign: 'center' },
});
