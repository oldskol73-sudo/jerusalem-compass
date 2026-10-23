import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

export function PassageSheet({ onClose }: { onClose: () => void }) {
  const { bible, scrBook, scrChapter, setScripturePosition } = useJerusalem();
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

  const { theme } = useJerusalem();
  const bookBtnStyle = (active: boolean) => [
    styles.bookBtn,
    { backgroundColor: active ? theme.accent : theme.card, borderColor: theme.border },
  ];
  const bookTextStyle = (active: boolean) => ({ color: active ? theme.onaccent : theme.text, fontSize: 11.5, fontWeight: '600' as const });

  if (pickerBook != null) {
    const book = bible[pickerBook];
    return (
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, { color: theme.text }]}>{book.n}</Text>
          <Pressable onPress={() => setPickerBook(null)}>
            <Text style={{ color: theme.muted, fontSize: 13, fontWeight: '600' }}>All books</Text>
          </Pressable>
        </View>
        <View style={styles.chapterGrid}>
          {book.c.map((_, c) => (
            <Pressable key={c} style={bookBtnStyle(pickerBook === scrBook && c === scrChapter)} onPress={() => pickChapter(c)}>
              <Text style={bookTextStyle(pickerBook === scrBook && c === scrChapter)}>{c + 1}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const ot = bible.slice(0, 39);
  const nt = bible.slice(39);

  return (
    <View style={{ gap: 10 }}>
      <Text style={[styles.title, { color: theme.text }]}>Choose a book</Text>
      <Text style={[styles.sectionLabel, { color: theme.muted }]}>Old Testament</Text>
      <View style={styles.bookGrid}>
        {ot.map((b, i) => (
          <Pressable key={b.n} style={bookBtnStyle(i === scrBook)} onPress={() => pickBook(i)}>
            <Text style={bookTextStyle(i === scrBook)}>{b.n}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.sectionLabel, { color: theme.muted, marginTop: 6 }]}>New Testament</Text>
      <View style={styles.bookGrid}>
        {nt.map((b, i) => (
          <Pressable key={b.n} style={bookBtnStyle(i + 39 === scrBook)} onPress={() => pickBook(i + 39)}>
            <Text style={bookTextStyle(i + 39 === scrBook)}>{b.n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.sansBold, fontSize: 16 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' },
  bookGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bookBtn: { flexBasis: '31%', borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
});
