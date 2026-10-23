import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenScroll } from '@/components/screen-scroll';
import { SectionCard } from '@/components/section-card';
import { ToggleSwitch } from '@/components/toggle-switch';
import { FONTS } from '@/constants/fonts';
import { verseRef } from '@/lib/bible';
import { useJerusalem } from '@/state/jerusalem-store';

const DURATIONS: { minutes: 5 | 10 | 15; label: string }[] = [
  { minutes: 5, label: 'MORNING' },
  { minutes: 10, label: 'AFTERNOON' },
  { minutes: 15, label: 'EVENING' },
];

export default function PrayerSetupScreen() {
  const s = useJerusalem();
  const attachedRef = s.attachedVerse && s.bible ? verseRef(s.bible, s.attachedVerse) : null;
  const journalLabel = s.journal.length ? `${s.journal.length} entr${s.journal.length === 1 ? 'y' : 'ies'}` : 'Write a reflection';
  const historyLabel = s.history.length ? `${s.history.length} prayer${s.history.length === 1 ? '' : 's'}` : 'No prayers yet';

  return (
    <ScreenScroll noTopInset contentStyle={{ paddingHorizontal: 0 }}>
      <ImageBackground source={require('@/assets/images/app/cover-daniel.jpg')} style={styles.hero} resizeMode="cover">
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
        <Text style={styles.heroTitle}>Prayer</Text>
      </ImageBackground>

      <View style={styles.body}>
        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionLabel, { color: s.theme.muted, textAlign: 'center' }]}>Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => {
              const active = s.prayerDuration === d.minutes;
              return (
                <Pressable
                  key={d.minutes}
                  style={[styles.durationBtn, { backgroundColor: active ? s.theme.accent : s.theme.card, borderColor: s.theme.border }]}
                  onPress={() => s.setPrayerDuration(d.minutes)}>
                  <Text style={{ color: active ? s.theme.onaccent : s.theme.text, fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
                    {d.label}
                    {'\n'}{d.minutes} min
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {attachedRef && (
          <SectionCard style={styles.rowCard}>
            <View>
              <Text style={{ color: s.theme.text, fontSize: 14, fontWeight: '600' }}>{attachedRef}</Text>
              <Text style={{ color: s.theme.muted, fontSize: 12 }}>Shown during prayer</Text>
            </View>
            <Pressable onPress={s.detachVerse}>
              <Text style={{ color: s.theme.muted, fontSize: 13, fontWeight: '600' }}>Remove</Text>
            </Pressable>
          </SectionCard>
        )}

        <SectionCard style={styles.rowCard}>
          <View>
            <Text style={{ color: s.theme.text, fontSize: 14, fontWeight: '600' }}>Silent Mode</Text>
            <Text style={{ color: s.theme.muted, fontSize: 12 }}>Mute all sound during prayer</Text>
          </View>
          <ToggleSwitch on={s.silentMode} onToggle={s.toggleSilent} />
        </SectionCard>

        <Pressable style={[styles.beginBtn, { backgroundColor: s.theme.accent }]} onPress={s.startSession}>
          <Text style={{ color: s.theme.onaccent, fontWeight: '700', fontSize: 16 }}>Begin Prayer</Text>
        </Pressable>

        <View style={styles.grid2}>
          <Pressable style={[styles.linkCard, { backgroundColor: s.theme.card, borderColor: s.theme.border }]} onPress={() => router.push('/(tabs)/prayer/journal')}>
            <Text style={{ color: s.theme.text, fontSize: 13, fontWeight: '600' }}>Prayer Journal</Text>
            <Text style={{ color: s.theme.muted, fontSize: 12 }}>{journalLabel}</Text>
          </Pressable>
          <Pressable style={[styles.linkCard, { backgroundColor: s.theme.card, borderColor: s.theme.border }]} onPress={() => router.push('/(tabs)/prayer/history')}>
            <Text style={{ color: s.theme.text, fontSize: 13, fontWeight: '600' }}>Prayer History</Text>
            <Text style={{ color: s.theme.muted, fontSize: 12 }}>{historyLabel}</Text>
          </Pressable>
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 300, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: FONTS.serifSemiBold, fontSize: 22, color: '#fff' },
  body: { paddingHorizontal: 20, gap: 16, marginTop: 16 },
  sectionLabel: { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' },
  durationRow: { flexDirection: 'row', gap: 10 },
  durationBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 10 },
  rowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  beginBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  grid2: { flexDirection: 'row', gap: 10 },
  linkCard: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 16, gap: 4 },
});
