import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

export function ReminderBanner() {
  const { reminderBanner, votd, snoozeMin, snoozeReminder, dismissReminder, theme, sessionPhase } = useJerusalem();
  const insets = useSafeAreaInsets();

  if (!reminderBanner || sessionPhase) return null;

  const v = votd();
  const now = new Date();
  const hour = ((now.getHours() + 11) % 12) + 1;
  const minute = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() < 12 ? 'AM' : 'PM';
  const title = /prayer/i.test(reminderBanner.label) ? reminderBanner.label : `${reminderBanner.label} prayer`;

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 72, backgroundColor: theme.card, borderColor: theme.navactive }]}>
      <View style={styles.header}>
        <Text style={{ color: theme.navactive, fontSize: 11, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>
          {title} · {hour}:{minute} {ampm}
        </Text>
        <Text style={{ color: theme.muted, fontSize: 12 }}>{v.ref}</Text>
      </View>
      {!!v.text && <Text style={[styles.verse, { color: theme.text, fontFamily: FONTS.serifRegular }]}>{v.text}</Text>}
      <View style={styles.actions}>
        <Pressable style={[styles.actionBtn, { borderColor: theme.border }]} onPress={snoozeReminder}>
          <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>Snooze {snoozeMin} min</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, { borderColor: theme.border }]} onPress={dismissReminder}>
          <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  verse: { fontSize: 14.5, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
