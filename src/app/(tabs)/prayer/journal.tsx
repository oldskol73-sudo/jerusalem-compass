import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackLink, ScreenTitle } from '@/components/screen-header';
import { ScreenScroll } from '@/components/screen-scroll';
import { SectionCard } from '@/components/section-card';
import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

function formatDate(at: number) {
  const d = new Date(at);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const day = d.toDateString() === today.toDateString() ? 'Today'
    : d.toDateString() === yest.toDateString() ? 'Yesterday'
    : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${day} · ${time}`;
}

export default function JournalScreen() {
  const { theme, journal, saveJournalEntry, deleteJournalEntry } = useJerusalem();
  const [draft, setDraft] = useState('');
  const hasDraft = draft.trim().length > 0;

  return (
    <ScreenScroll contentStyle={{ paddingHorizontal: 20 }}>
      <BackLink label="Prayer" />
      <ScreenTitle title="Prayer Journal" />

      <SectionCard style={{ gap: 10 }}>
        <TextInput
          style={[styles.textarea, { color: theme.text, fontFamily: FONTS.serifRegular }]}
          placeholder="What did you bring before God today?"
          placeholderTextColor={theme.muted}
          multiline
          value={draft}
          onChangeText={setDraft}
        />
        <View style={[styles.saveRow, { borderTopColor: theme.border }]}>
          <Text style={{ color: theme.muted, fontSize: 12 }}>Stored on this device only</Text>
          <Pressable
            disabled={!hasDraft}
            style={[styles.saveBtn, { backgroundColor: hasDraft ? theme.accent : theme.border }]}
            onPress={() => { saveJournalEntry(draft); setDraft(''); }}>
            <Text style={{ color: hasDraft ? theme.onaccent : theme.muted, fontSize: 13, fontWeight: '700' }}>Save entry</Text>
          </Pressable>
        </View>
      </SectionCard>

      {journal.length === 0 && (
        <Text style={{ color: theme.muted, fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>No entries yet.</Text>
      )}
      {journal.map((entry) => (
        <SectionCard key={entry.id} style={{ gap: 8 }}>
          <View style={styles.entryHeader}>
            <Text style={{ color: theme.navactive, fontSize: 11, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>
              {formatDate(entry.at)}
            </Text>
            <Pressable onPress={() => deleteJournalEntry(entry.id)}>
              <Text style={{ color: theme.muted, fontSize: 12, fontWeight: '600' }}>Delete</Text>
            </Pressable>
          </View>
          <Text style={{ color: theme.text, fontFamily: FONTS.serifRegular, fontSize: 15, lineHeight: 23 }}>{entry.text}</Text>
        </SectionCard>
      ))}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  textarea: { minHeight: 110, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
  saveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 10 },
  saveBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
