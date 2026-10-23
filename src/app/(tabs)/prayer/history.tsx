import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/app-text';
import { BackLink, ScreenTitle } from '@/components/screen-header';
import { ScreenScroll } from '@/components/screen-scroll';
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
const periodOf = (p: number) => (p === 5 ? 'Morning' : p === 10 ? 'Afternoon' : 'Evening');

export default function HistoryScreen() {
  const { theme, history } = useJerusalem();
  const totalMin = history.reduce((a, h) => a + h.minutes, 0);

  return (
    <ScreenScroll contentStyle={{ paddingHorizontal: 20 }}>
      <BackLink label="Prayer" />
      <ScreenTitle
        title="Prayer History"
        trailing={history.length ? (
          <Text style={{ color: theme.muted, fontSize: 12 }}>{history.length} prayers · {totalMin} min</Text>
        ) : undefined}
      />

      {history.length === 0 && (
        <Text style={{ color: theme.muted, fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
          Completed prayers will appear here.
        </Text>
      )}

      {history.length > 0 && (
        <View style={[styles.list, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {history.map((h, i) => (
            <View key={h.id} style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: i < history.length - 1 ? 1 : 0 }]}>
              <View style={{ gap: 2 }}>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{periodOf(h.period)} prayer</Text>
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  {formatDate(h.at)}{h.verse ? ` · ${h.verse}` : ''}
                </Text>
              </View>
              <Text style={{ color: theme.navactive, fontSize: 13, fontWeight: '600' }}>{h.minutes} min</Text>
            </View>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, gap: 12 },
});
