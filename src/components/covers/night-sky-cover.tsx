import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/app-text';
import { BrandRow, CREAM, DiamondDivider, FindButton, GOLD, GOLD_SOFT, Stars } from '@/components/covers/cover-parts';
import { FONTS } from '@/constants/fonts';

/** Cover 1: a starry sky over the compass, with Jerusalem at its center. */
export function NightSkyCover() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const size = Math.round(Math.max(190, Math.min(268, height * 0.31)));

  const breathe = useSharedValue(0);
  const spin = useSharedValue(0);
  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })),
      -1,
    );
    spin.value = withRepeat(withTiming(360, { duration: 90000, easing: Easing.linear }), -1);
  }, [breathe, spin]);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + 0.45 * breathe.value,
    transform: [{ scale: 1 + 0.06 * breathe.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1b2545', '#0b1022', '#05070f']} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <Stars />

      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(800)}>
          <BrandRow />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(150)} style={{ width: size, height: size, marginVertical: 18 }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -26,
                left: -26,
                right: -26,
                bottom: -26,
                borderRadius: size,
                experimental_backgroundImage: 'radial-gradient(circle, rgba(240,196,92,0.38), rgba(240,196,92,0) 65%)',
              } as object,
              glowStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -10,
                left: -10,
                right: -10,
                bottom: -10,
                borderRadius: size,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: 'rgba(217,184,102,0.55)',
              },
              ringStyle,
            ]}
          />
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              overflow: 'hidden',
              boxShadow: '0 0 0 2px #a9791f, 0 18px 40px rgba(0,0,0,0.6)',
            } as object}>
            <Image
              source={require('@/assets/images/Compass.png')}
              accessibilityLabel="Compass with Jerusalem at its center"
              style={{ position: 'absolute', width: size * 1.12, height: size * 1.12, left: -size * 0.06, top: -size * 0.06 }}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(300)} style={styles.titleBlock}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.titleLine} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} maxFontSizeMultiplier={1.1}>FACE</Text>
            <Text style={styles.titleLine} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} maxFontSizeMultiplier={1.1}>JERUSALEM</Text>
          </View>
          <DiamondDivider />
          <Text style={styles.quote}>&ldquo;his windows being open in his chamber toward Jerusalem&rdquo;</Text>
          <Text style={styles.ref}>Daniel 6:10</Text>
          <View style={{ width: '100%', marginTop: 8 }}>
            <FindButton variant="pill" />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070f' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 28 },
  titleBlock: { alignItems: 'center', gap: 14, width: '100%' },
  titleLine: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: 2.4,
    textAlign: 'center',
    color: GOLD,
    maxWidth: '100%',
    textShadowColor: 'rgba(143,100,24,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  quote: { fontFamily: FONTS.serifItalic, fontSize: 16, lineHeight: 24, color: CREAM, textAlign: 'center', maxWidth: 290 },
  ref: { fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: GOLD_SOFT, fontWeight: '700' },
});
