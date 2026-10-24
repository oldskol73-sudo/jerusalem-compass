import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/app-text';
import { BackLink, ScreenTitle } from '@/components/screen-header';
import { ScreenScroll } from '@/components/screen-scroll';
import { FONTS } from '@/constants/fonts';
import { SITES } from '@/constants/jerusalem';
import { useJerusalem } from '@/state/jerusalem-store';

export default function JerusalemInfoScreen() {
  const { theme, bible, openVerse } = useJerusalem();

  let jerusalemDateLabel = '';
  let jerusalemTimeLabel = '—';
  try {
    jerusalemDateLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
    jerusalemTimeLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', hour: 'numeric', minute: '2-digit' }).format(new Date());
  } catch {
    // ignore
  }

  const goToSite = (book: string, chapter: number, verse: number) => {
    const b = bible ? bible.findIndex((x) => x.n === book) : -1;
    if (b >= 0) openVerse(b, chapter - 1, verse - 1);
  };

  return (
    <ScreenScroll contentStyle={{ paddingHorizontal: 20 }}>
      <BackLink label="More" />
      <ScreenTitle title="Jerusalem" />

      <View style={[styles.timeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={{ gap: 2 }}>
          <Text style={[styles.smallCaps, { color: theme.muted }]}>Local time in Jerusalem</Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>{jerusalemDateLabel}</Text>
        </View>
        <Text style={{ fontFamily: FONTS.serifSemiBold, fontSize: 30, color: theme.navactive }}>{jerusalemTimeLabel}</Text>
      </View>

      <LinearGradient colors={[theme.accent, theme.bg]} style={[styles.mapBox, { borderColor: theme.border }]}>
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={9} r={5} stroke="#fff" strokeWidth={1.6} />
          <Path d="M12 20c0-3-4-6-4-10a4 4 0 118 0c0 4-4 7-4 10z" stroke="#fff" strokeWidth={1.6} />
        </Svg>
        <Text style={{ color: '#fff', fontSize: 12, marginTop: 8, opacity: 0.85 }}>Jerusalem · 31.78°N, 35.24°E</Text>
      </LinearGradient>

      <Text style={[styles.smallCaps, { color: theme.muted }]}>Historical sites</Text>
      <View style={{ gap: 10 }}>
        {SITES.map((site) => (
          <View key={site.name} style={[styles.siteCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={{ fontFamily: FONTS.serifSemiBold, fontSize: 16, color: theme.text }}>{site.name}</Text>
            <Text style={{ fontSize: 13.5, lineHeight: 20, color: theme.text }}>{site.text}</Text>
            <Pressable onPress={() => goToSite(site.book, site.chapter, site.verse)}>
              <Text style={{ color: theme.navactive, fontSize: 12.5, fontWeight: '700' }}>
                {site.book} {site.chapter}:{site.verse}{site.endVerse ? `–${site.endVerse}` : ''}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  timeCard: { borderWidth: 1, borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallCaps: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' },
  mapBox: { width: '100%', height: 220, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  siteCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 6 },
});
