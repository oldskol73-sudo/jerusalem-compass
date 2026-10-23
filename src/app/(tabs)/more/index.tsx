import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenScroll } from '@/components/screen-scroll';
import { ToggleSwitch } from '@/components/toggle-switch';
import { FONTS } from '@/constants/fonts';
import { type Atmosphere } from '@/constants/jerusalem';
import { useJerusalem } from '@/state/jerusalem-store';
import { useSheets } from '@/state/sheets-store';

const ATMOSPHERES: { key: Atmosphere; label: string }[] = [
  { key: 'parchment', label: 'Royal\nParchment' },
  { key: 'stone', label: 'Temple\nStone' },
  { key: 'midnight', label: 'Midnight\nScroll' },
];

export default function MoreScreen() {
  const s = useJerusalem();
  const { setOpenSheet } = useSheets();
  const theme = s.theme;

  const remindersOn = s.reminders.filter((r) => r.on).length;
  const remindersSummary = remindersOn ? `${remindersOn} daily` : 'Off';
  let jerusalemTimeLabel = '—';
  try {
    jerusalemTimeLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', hour: 'numeric', minute: '2-digit' }).format(new Date());
  } catch {
    // ignore
  }

  const tabBtn = (active: boolean) => [
    styles.atmBtn,
    { backgroundColor: active ? theme.accent : theme.card, borderColor: theme.border },
  ];

  const rows: { label: string; value?: string; onPress?: () => void }[] = [
    { label: 'Music and Audio', value: s.musicApp ?? 'Not connected', onPress: () => setOpenSheet('music') },
    { label: 'Prayer Reminders', value: remindersSummary, onPress: () => router.push('/(tabs)/more/reminders') },
    { label: 'Jerusalem Information', value: jerusalemTimeLabel, onPress: () => router.push('/(tabs)/more/jerusalem-info') },
    { label: 'Privacy and Security' },
    { label: 'Compass Calibration', onPress: () => setOpenSheet('calibration') },
    { label: 'JOE Diagnostics', onPress: () => setOpenSheet('diagnostics') },
  ];

  return (
    <ScreenScroll noTopInset contentStyle={{ paddingHorizontal: 0 }}>
      <LinearGradient colors={[theme.accent, theme.bg]} style={styles.hero}>
        <Text style={styles.heroTitle}>Face Jerusalem</Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={{ gap: 8 }}>
          <View style={styles.rowBetween}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings & More</Text>
            <Text style={[styles.smallCaps, { color: theme.muted }]}>Reading Atmosphere</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>Show Cover at Launch</Text>
                <Text style={{ color: theme.muted, fontSize: 12 }}>Open to the Face Jerusalem cover each time</Text>
              </View>
              <ToggleSwitch on={s.showCoverAtLaunch} onToggle={s.toggleShowCoverAtLaunch} />
            </View>
          </View>
          <View style={styles.grid3}>
            {ATMOSPHERES.map((a) => (
              <Pressable key={a.key} style={tabBtn(s.atmosphere === a.key)} onPress={() => s.setAtmosphere(a.key)}>
                <Text style={{ color: s.atmosphere === a.key ? theme.onaccent : theme.text, fontSize: 11, fontWeight: '600', textAlign: 'center' }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.listCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {rows.map((r, i) => (
            <Pressable
              key={r.label}
              disabled={!r.onPress}
              onPress={r.onPress}
              style={[styles.listRow, { borderBottomColor: theme.border, borderBottomWidth: i < rows.length - 1 ? 1 : 0 }]}>
              <Text style={{ color: theme.text, fontSize: 14 }}>{r.label}</Text>
              {r.value && <Text style={{ color: theme.muted, fontSize: 12.5 }}>{r.value}</Text>}
            </Pressable>
          ))}
        </View>

        <View style={[styles.card, styles.rowBetween, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 14 }}>Alignment haptic</Text>
          <ToggleSwitch on={s.hapticsEnabled} onToggle={s.toggleHaptics} />
        </View>

        <View style={{ alignItems: 'center', gap: 4, paddingTop: 6 }}>
          <Pressable onPress={() => setOpenSheet('about')}>
            <Text style={{ fontFamily: FONTS.serifRegular, color: theme.muted, fontSize: 14 }}>About Face Jerusalem</Text>
          </Pressable>
          <Text style={{ color: theme.muted, fontSize: 12, textAlign: 'center' }}>
            Turn toward Jerusalem. Pray. Give thanks. Continue as before.
          </Text>
          <Text style={{ color: theme.muted, fontSize: 11, marginTop: 8 }}>A Twelve Scents Publishing Digital Experience</Text>
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 230, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: FONTS.serifSemiBold, fontSize: 22, color: '#fff' },
  body: { paddingHorizontal: 20, gap: 18, marginTop: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: FONTS.serifSemiBold, fontSize: 20 },
  smallCaps: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  grid3: { flexDirection: 'row', gap: 8 },
  atmBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10 },
  listCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  listRow: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
