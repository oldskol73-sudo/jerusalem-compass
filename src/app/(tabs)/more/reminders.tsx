import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Text } from '@/components/app-text';
import { BackLink, ScreenTitle } from '@/components/screen-header';
import { GhostButton } from '@/components/ghost-button';
import { ScreenScroll } from '@/components/screen-scroll';
import { SectionCard } from '@/components/section-card';
import { ToggleSwitch } from '@/components/toggle-switch';
import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const hour = ((h + 11) % 12) + 1;
  return `${hour}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export default function RemindersScreen() {
  const s = useJerusalem();
  const theme = s.theme;
  const [editingId, setEditingId] = useState<string | null>(null);

  const setTime = (id: string, time: string) => {
    s.setReminders(s.reminders.map((r) => (r.id === id ? { ...r, time } : r)));
  };
  const toggle = (id: string) => {
    s.setReminders(s.reminders.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
  };
  const remove = (id: string) => {
    s.setReminders(s.reminders.filter((r) => r.id !== id));
  };

  const v = s.votd();
  const editing = s.reminders.find((r) => r.id === editingId);

  return (
    <ScreenScroll contentStyle={{ paddingHorizontal: 20 }}>
      <BackLink label="More" />
      <View style={{ gap: 4 }}>
        <ScreenTitle title="Prayer Reminders" />
        <Text style={{ fontFamily: FONTS.serifItalic, color: theme.muted, fontSize: 14, lineHeight: 20 }}>
          He kneeled upon his knees three times a day, and prayed. Daniel 6:10
        </Text>
      </View>

      <View style={[styles.list, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {s.reminders.map((r, i) => (
          <View key={r.id} style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: i < s.reminders.length ? 1 : 0 }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{r.label}</Text>
              {r.custom && (
                <Pressable onPress={() => remove(r.id)}>
                  <Text style={{ color: theme.muted, fontSize: 12, fontWeight: '600' }}>Remove</Text>
                </Pressable>
              )}
            </View>
            <Pressable
              style={[styles.timeBtn, { borderColor: theme.border }]}
              onPress={() => setEditingId(r.id)}>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{formatTime(r.time)}</Text>
            </Pressable>
            <ToggleSwitch on={r.on} onToggle={() => toggle(r.id)} />
          </View>
        ))}
        <Pressable style={styles.addRow} onPress={s.addReminder}>
          <Text style={{ color: theme.navactive, fontSize: 14, fontWeight: '700' }}>+ Add reminder</Text>
        </Pressable>
      </View>

      {editing && (
        <DateTimePicker
          value={(() => { const [h, m] = editing.time.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d; })()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            if (date) setTime(editing.id, `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
            setEditingId(null);
          }}
        />
      )}

      <View style={{ gap: 8 }}>
        <Text style={[styles.smallCaps, { color: theme.muted }]}>Snooze</Text>
        <View style={styles.grid3}>
          {[5, 10, 15].map((m) => (
            <GhostButton
              key={m}
              label={`${m} min`}
              active={s.snoozeMin === m}
              onPress={() => s.setSnoozeMin(m)}
              style={{ flex: 1 }}
            />
          ))}
        </View>
      </View>

      <SectionCard style={{ gap: 6 }}>
        <Text style={[styles.smallCaps, { color: theme.navactive, fontWeight: '700' }]}>Today&rsquo;s verse</Text>
        <Text style={{ color: theme.text, fontFamily: FONTS.serifRegular, fontSize: 15, lineHeight: 23 }}>{v.text}</Text>
        <Text style={{ color: theme.muted, fontSize: 12, fontWeight: '600' }}>{v.ref}</Text>
      </SectionCard>

      <GhostButton label="Preview a reminder" onPress={s.testReminder} />
      <Text style={{ color: theme.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
        Reminders sound while Face Jerusalem is open, and arrive as notifications when it is closed. Silent Mode mutes
        the in-app chime.
      </Text>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  timeBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  addRow: { padding: 16 },
  smallCaps: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' },
  grid3: { flexDirection: 'row', gap: 8 },
});
