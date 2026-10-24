import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/app-text';
import { MiniCompassBadge } from '@/components/mini-compass-badge';
import { ScreenScroll } from '@/components/screen-scroll';
import { SectionCard } from '@/components/section-card';
import { FONTS } from '@/constants/fonts';
import { CONFIDENCE_LABEL, formatDistance } from '@/constants/jerusalem';
import { useJerusalem } from '@/state/jerusalem-store';
import { useSheets } from '@/state/sheets-store';

function useGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

function useJerusalemTimeLabel() {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', hour: 'numeric', minute: '2-digit' }).format(new Date());
  } catch {
    return '—';
  }
}

export default function HomeScreen() {
  const s = useJerusalem();
  const { setOpenSheet } = useSheets();
  const greeting = useGreeting();
  const jerusalemTime = useJerusalemTimeLabel();
  const insets = useSafeAreaInsets();

  const locBadge = s.locationSource === 'gps' ? 'Live location'
    : s.locationSource === 'manual' ? `Manual: ${s.locationLabel}`
    : `Demo location: ${s.locationLabel}`;
  const showPermissionBanner = s.locationPermission === 'denied' || s.locationPermission === 'unavailable';

  return (
    <ScreenScroll noTopInset contentStyle={{ paddingHorizontal: 0 }}>
      <LinearGradient colors={[s.theme.accent, s.theme.bg]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.heroWordmark} numberOfLines={1} adjustsFontSizeToFit>FACE JERUSALEM</Text>
        <Text style={styles.heroTag}>Know the direction. Pray. Give thanks.</Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={[styles.greeting, { color: s.theme.text }]}>{greeting}</Text>

        {showPermissionBanner && (
          <SectionCard>
            <Text style={{ color: s.theme.text, fontSize: 13, lineHeight: 19, marginBottom: 10 }}>
              Face Jerusalem uses your location to calculate the direction and distance to Jerusalem. Your location
              is processed on this device.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable style={[styles.smallBtn, { backgroundColor: s.theme.accent }]} onPress={s.retryLocationPermission}>
                <Text style={{ color: s.theme.onaccent, fontSize: 13, fontWeight: '600' }}>Try again</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, { borderWidth: 1, borderColor: s.theme.border }]} onPress={() => setOpenSheet('manual')}>
                <Text style={{ color: s.theme.text, fontSize: 13, fontWeight: '600' }}>Manual location</Text>
              </Pressable>
            </View>
          </SectionCard>
        )}

        <SectionCard style={styles.dialCard}>
          <Text style={[styles.badgeLabel, { color: s.theme.muted }]}>{locBadge}</Text>
          <View style={{ marginTop: 22 }}>
            <MiniCompassBadge />
          </View>
          <View style={{ alignItems: 'center', gap: 2, marginTop: 14 }}>
            <Text style={[styles.smallCaps, { color: s.theme.muted }]}>Jerusalem</Text>
            <Text style={{ color: s.theme.text, fontWeight: '600', fontSize: 15 }}>
              {Math.round(s.bearingDeg)}° · {s.distanceKm < 1 ? 'You are in Jerusalem' : formatDistance(s.distanceKm)}
            </Text>
            <Text style={{ color: s.theme.muted, fontSize: 12, marginTop: 2 }}>{s.alignmentLabel}</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, rowGap: 4, marginTop: 14 }}>
            <Text style={{ color: s.theme.muted, fontSize: 11 }}>
              JOE confidence: <Text style={{ color: s.theme.text, fontWeight: '700' }}>{CONFIDENCE_LABEL[s.overallConf]}</Text>
            </Text>
            <Text style={{ color: s.theme.muted, fontSize: 11 }}>
              {s.headingAvailable ? 'True North • Approx' : 'Simulated heading'}
            </Text>
          </View>
        </SectionCard>

        <Pressable style={[styles.beginBtn, { backgroundColor: s.theme.accent }]} onPress={() => router.push('/(tabs)/prayer')}>
          <Text style={{ color: s.theme.onaccent, fontWeight: '700', fontSize: 16 }}>Begin Prayer</Text>
        </Pressable>

        <SectionCard style={{ gap: 6 }}>
          <Text style={[styles.smallCaps, { color: s.theme.muted }]}>Daily Scripture</Text>
          <Text style={{ color: s.theme.text, fontFamily: FONTS.serifRegular, fontSize: 17, lineHeight: 25 }}>
            &ldquo;His windows being open in his chamber toward Jerusalem&hellip;&rdquo;
          </Text>
          <Text style={{ color: s.theme.muted, fontSize: 12 }}>Daniel 6:10</Text>
        </SectionCard>

        <View style={styles.timeRow}>
          <Text style={{ color: s.theme.muted, fontSize: 12 }}>Jerusalem time</Text>
          <Text style={{ color: s.theme.text, fontSize: 13, fontWeight: '600' }}>{jerusalemTime}</Text>
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', minHeight: 230, paddingBottom: 24, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 24 },
  heroWordmark: { fontFamily: FONTS.serifSemiBold, fontSize: 26, letterSpacing: 2, color: '#fff' },
  heroTag: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  body: { paddingHorizontal: 20, gap: 18, marginTop: 18 },
  greeting: { fontFamily: FONTS.serifSemiBold, fontSize: 26 },
  dialCard: { alignItems: 'center', gap: 4, position: 'relative' },
  badgeLabel: { position: 'absolute', top: 14, left: 16, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  smallCaps: { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  smallBtn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  beginBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
});
