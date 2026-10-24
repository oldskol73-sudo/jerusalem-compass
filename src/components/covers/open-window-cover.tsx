import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/app-text';
import { FindButton, GOLD_SOFT } from '@/components/covers/cover-parts';
import { FONTS } from '@/constants/fonts';

/** Cover 2: Daniel at the open window, in a gold frame crossed like window panes. */
export function OpenWindowCover() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // Frame keeps the 280 x 360 proportion and shrinks on short or narrow screens.
  const frameH = Math.round(Math.max(250, Math.min(360, height * 0.43, ((width - 56) * 360) / 280)));
  const frameW = Math.round((frameH * 280) / 360);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#3a2a12', '#140e06', '#0a0704']} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />

      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(800)}>
          <Text style={styles.brand} numberOfLines={1}>Twelve Scents Publishing</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(100)} style={{ width: frameW, height: frameH }}>
          <LinearGradient
            colors={['#f4e2a1', '#a9791f', '#f4e2a1', '#7a5714']}
            locations={[0, 0.45, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.frame}>
            <View style={{ flex: 1, overflow: 'hidden', borderRadius: 1 }}>
              <Image
                source={require('@/assets/images/app/cover-daniel.jpg')}
                accessibilityLabel="Daniel kneeling with arms raised in prayer toward Jerusalem"
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(255,220,140,0.18)', 'rgba(255,220,140,0)', 'rgba(10,7,4,0.85)']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
              />
              {/* window panes */}
              <LinearGradient colors={['#e9c873', '#8f6418']} style={styles.paneV} />
              <LinearGradient colors={['#8f6418', '#e9c873', '#8f6418']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.paneH} />
              <View style={styles.frameTitleWrap}>
                <Text style={styles.frameTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1.1}>FACE</Text>
                <Text style={styles.frameTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1.1}>JERUSALEM</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(300)} style={styles.bottom}>
          <Text style={styles.quote}>
            &ldquo;his windows being open in his chamber toward Jerusalem, he kneeled upon his knees three times a day&rdquo;
          </Text>
          <Text style={styles.ref}>Daniel 6:10</Text>
          <View style={{ width: '100%', marginTop: 10 }}>
            <FindButton variant="outline" />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0704' },
  content: { flexGrow: 1, alignItems: 'center', gap: 22, paddingHorizontal: 28 },
  brand: { fontSize: 10, letterSpacing: 2.8, textTransform: 'uppercase', color: GOLD_SOFT, fontWeight: '700' },
  frame: { flex: 1, borderRadius: 4, padding: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' } as object,
  paneV: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 3, marginLeft: -1.5 },
  paneH: { position: 'absolute', left: 0, right: 0, top: '46%', height: 3 },
  frameTitleWrap: { position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center', paddingHorizontal: 12 },
  frameTitle: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: 2,
    color: '#fbe7a6',
    textAlign: 'center',
    maxWidth: '100%',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  bottom: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  quote: { fontFamily: FONTS.serifItalic, fontSize: 19, lineHeight: 28, color: '#f3e6c6', textAlign: 'center', maxWidth: 300 },
  ref: { fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: GOLD_SOFT, fontWeight: '700' },
});
