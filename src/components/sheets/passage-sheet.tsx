import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/app-text';
import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

// The 14 Apocrypha books are stored after Revelation so saved verse positions keep working.
const CANON_COUNT = 66;
const BOOK_COLUMNS = 3;
const CHAPTER_COLUMNS = 6;

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

export function PassageSheet({ onClose }: { onClose: () => void }) {
  const { bible, scrBook, scrChapter, setScripturePosition, theme } = useJerusalem();
  const [pickerBook, setPickerBook] = useState<number | null>(null);

  if (!bible) return null;

  const pickBook = (i: number) => {
    if (bible[i].c.length === 1) {
      setScripturePosition(i, 0);
      onClose();
    } else {
      setPickerBook(i);
    }
  };

  const pickChapter = (c: number) => {
    if (pickerBook == null) return;
    setScripturePosition(pickerBook, c);
    onClose();
  };

  // Equal-width cells in fixed-column rows, so every label sits centered in a same-size button
  // and a short last row keeps the same column widths.
  const renderGrid = (items: { key: string; label: string; active: boolean; onPress: () => void }[], columns: number) => (
    <View style={{ gap: 6 }}>
      {chunk(items, columns).map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((it) => (
            <Pressable
              key={it.key}
              style={[
                styles.cell,
                { backgroundColor: it.active ? theme.accent : theme.card, borderColor: it.active ? theme.accent : theme.border },
              ]}
              onPress={it.onPress}>
              <Text
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={[styles.cellText, { color: it.active ? theme.onaccent : theme.text }]}>
                {it.label}
              </Text>
            </Pressable>
          ))}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <View key={`pad-${i}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );

  if (pickerBook != null) {
    const book = bible[pickerBook];
    return (
      <View style={{ gap: 12 }}>
        <View style={styles.headRow}>
          <Text style={[styles.title, { color: theme.text, flexShrink: 1 }]} numberOfLines={1}>{book.n}</Text>
          <Pressable hitSlop={8} onPress={() => setPickerBook(null)}>
            <Text style={{ color: theme.muted, fontSize: 13, fontWeight: '600' }}>All books</Text>
          </Pressable>
        </View>
        {renderGrid(
          book.c.map((_, c) => ({
            key: String(c),
            label: String(c + 1),
            active: pickerBook === scrBook && c === scrChapter,
            onPress: () => pickChapter(c),
          })),
          CHAPTER_COLUMNS,
        )}
      </View>
    );
  }

  const toItems = (books: typeof bible, offset: number) =>
    books.map((b, i) => ({ key: b.n, label: b.n, active: i + offset === scrBook, onPress: () => pickBook(i + offset) }));

  const sections = [
    { label: 'Old Testament', items: toItems(bible.slice(0, 39), 0) },
    { label: 'New Testament', items: toItems(bible.slice(39, CANON_COUNT), 39) },
    { label: 'Apocrypha', items: toItems(bible.slice(CANON_COUNT), CANON_COUNT) },
  ].filter((section) => section.items.length > 0);

  return (
    <View style={{ gap: 12 }}>
      <Text style={[styles.title, { color: theme.text, textAlign: 'center' }]}>Choose a book</Text>
      {sections.map((section) => (
        <View key={section.label} style={{ gap: 8 }}>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>{section.label}</Text>
          {renderGrid(section.items, BOOK_COLUMNS)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.sansBold, fontSize: 16 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 6 },
  cell: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
