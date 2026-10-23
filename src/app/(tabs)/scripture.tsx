import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/app-text';
import { ScreenScroll } from '@/components/screen-scroll';
import { FONTS } from '@/constants/fonts';
import { HIGHLIGHTS } from '@/constants/jerusalem';
import { searchBible, verseRef, verseText, type SearchHit } from '@/lib/bible';
import { useJerusalem } from '@/state/jerusalem-store';
import { useSheets } from '@/state/sheets-store';

type Tab = 'read' | 'search' | 'saved';

const PICKS_COLLAPSED = 6;

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

export default function ScriptureScreen() {
  const s = useJerusalem();
  const { setOpenSheet } = useSheets();
  const [tab, setTab] = useState<Tab>('read');
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState<{ hits: SearchHit[]; total: number; term: string } | null>(null);

  const theme = s.theme;
  const bible = s.bible;
  const insets = useSafeAreaInsets();
  const [group, setGroup] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const readerRef = useRef<ScrollView>(null);
  const verseOffsets = useRef<Record<number, number>>({});

  useEffect(() => {
    const t = setTimeout(() => {
      const y = s.scrVerse != null ? Math.max(0, (verseOffsets.current[s.scrVerse] ?? 0) - 8) : 0;
      readerRef.current?.scrollTo({ y, animated: true });
    }, 60);
    return () => clearTimeout(t);
  }, [s.scrBook, s.scrChapter, s.scrVerse]);

  const chapterVerses = useMemo(() => {
    if (!bible) return [];
    return bible[s.scrBook].c[s.scrChapter];
  }, [bible, s.scrBook, s.scrChapter]);

  const goChapter = (b: number, c: number) => s.setScripturePosition(b, c);
  const prevChapter = () => {
    if (!bible) return;
    if (s.scrChapter > 0) goChapter(s.scrBook, s.scrChapter - 1);
    else if (s.scrBook > 0) goChapter(s.scrBook - 1, bible[s.scrBook - 1].c.length - 1);
  };
  const nextChapter = () => {
    if (!bible) return;
    if (s.scrChapter < bible[s.scrBook].c.length - 1) goChapter(s.scrBook, s.scrChapter + 1);
    else if (s.scrBook < bible.length - 1) goChapter(s.scrBook + 1, 0);
  };

  const runSearch = () => {
    if (!bible) return;
    const { hits, total } = searchBible(bible, query, 100);
    setSearched({ hits, total, term: query.trim() });
  };

  const tabBtn = (active: boolean) => [
    styles.tabBtn,
    { backgroundColor: active ? theme.accent : theme.card, borderColor: theme.border },
  ];
  const tabText = (active: boolean) => ({ color: active ? theme.onaccent : theme.text, fontSize: 11, fontWeight: '600' as const });

  const hasSelection = s.scrVerse != null;
  const selectionRef = bible && hasSelection ? verseRef(bible, { b: s.scrBook, c: s.scrChapter, v: s.scrVerse! }) : '';
  const selSaved = hasSelection && s.isSaved({ b: s.scrBook, c: s.scrChapter, v: s.scrVerse! });

  const header = (
    <>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Scripture</Text>
        <Text style={[styles.kjv, { color: theme.muted }]}>King James Version</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable style={tabBtn(tab === 'read')} onPress={() => setTab('read')}><Text style={tabText(tab === 'read')}>Read</Text></Pressable>
        <Pressable style={tabBtn(tab === 'search')} onPress={() => setTab('search')}><Text style={tabText(tab === 'search')}>Search</Text></Pressable>
        <Pressable style={tabBtn(tab === 'saved')} onPress={() => setTab('saved')}><Text style={tabText(tab === 'saved')}>Saved</Text></Pressable>
      </View>

      {!s.bibleReady && (
        <Text style={{ color: theme.muted, fontSize: 13, textAlign: 'center', paddingVertical: 40 }}>Loading the King James Bible…</Text>
      )}
    </>
  );

  const allPicks = HIGHLIGHTS[group].refs;
  const picks = expanded ? allPicks : allPicks.slice(0, PICKS_COLLAPSED);
  const openPick = (name: string, c: number, v: number) => {
    if (!bible) return;
    const b = bible.findIndex((x) => x.n === name);
    if (b >= 0) s.openVerse(b, c - 1, v - 1);
  };
  const selectGroup = (i: number) => {
    setGroup(i);
    setExpanded(false);
    const [name, c, v] = HIGHLIGHTS[i].refs[0];
    openPick(name, c, v);
  };
  const selectedText =
    bible && hasSelection ? verseText(bible, { b: s.scrBook, c: s.scrChapter, v: s.scrVerse! }) : '';

  if (tab === 'read') {
    return (
      <View style={[styles.readRoot, { backgroundColor: theme.bg, paddingTop: insets.top + 16 }]}>
        <View style={styles.readTop}>{header}</View>

        {s.bibleReady && bible && (
          <>
            <View style={[styles.readTop, { gap: 10 }]}>
              <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.heroTag, { color: theme.muted }]} numberOfLines={1}>
                  {hasSelection ? `${selectionRef} · ${HIGHLIGHTS[group].label}` : `Selected verse · ${HIGHLIGHTS[group].label}`}
                </Text>
                {hasSelection ? (
                  <>
                    <Text numberOfLines={3} style={{ color: theme.text, fontFamily: FONTS.serifRegular, fontSize: 15, lineHeight: 21 }}>
                      &ldquo;{selectedText}&rdquo;
                    </Text>
                    <View style={styles.heroRow}>
                      <Pressable style={[styles.saveBtn, { borderColor: theme.border }]} onPress={() => s.toggleSaveVerse({ b: s.scrBook, c: s.scrChapter, v: s.scrVerse! })}>
                        <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{selSaved ? 'Saved' : 'Save'}</Text>
                      </Pressable>
                      <Pressable style={[styles.useBtn, { backgroundColor: theme.accent, flex: 1, alignItems: 'center' }]} onPress={s.useInPrayer}>
                        <Text style={{ color: theme.onaccent, fontSize: 13, fontWeight: '700' }}>Use in Prayer</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <Text style={{ color: theme.muted, fontSize: 14, lineHeight: 20 }}>Pick a verse below, or tap one in the chapter, to save it or use it in prayer.</Text>
                )}
              </View>

              <View style={styles.cats}>
                {HIGHLIGHTS.map((g, i) => {
                  const active = i === group;
                  return (
                    <Pressable
                      key={g.label}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      style={[styles.catBtn, { borderBottomColor: active ? theme.accent : theme.border }]}
                      onPress={() => selectGroup(i)}>
                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ color: active ? theme.text : theme.muted, fontSize: 13, fontWeight: active ? '800' : '600' }}>{g.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ gap: 6 }}>
                {chunk(picks, 3).map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.chipRow}>
                    {row.map(([name, c, v]) => {
                      const b = bible.findIndex((x) => x.n === name);
                      const active = b === s.scrBook && c - 1 === s.scrChapter && v - 1 === s.scrVerse;
                      return (
                        <Pressable
                          key={`${name}${c}${v}`}
                          style={[styles.chip, { backgroundColor: active ? theme.accent : theme.card, borderColor: active ? theme.accent : theme.border }]}
                          onPress={() => openPick(name, c, v)}>
                          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={{ color: active ? theme.onaccent : theme.text, fontSize: 12, fontWeight: '600' }}>
                            {name === 'Psalms' ? 'Psalm' : name} {c}:{v}
                          </Text>
                        </Pressable>
                      );
                    })}
                    {Array.from({ length: 3 - row.length }, (_, i) => (
                      <View key={`pad-${i}`} style={{ flex: 1 }} />
                    ))}
                  </View>
                ))}
                {allPicks.length > PICKS_COLLAPSED && (
                  <Pressable hitSlop={6} onPress={() => setExpanded((e) => !e)}>
                    <Text style={{ textAlign: 'center', color: theme.accent, fontSize: 12, fontWeight: '700' }}>
                      {expanded ? 'Show fewer' : `All ${allPicks.length} verses ▾`}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.readerWrap}>
              <View style={[styles.readerFill, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.readerHead, { borderBottomColor: theme.border }]}>
                  <Pressable hitSlop={8} style={styles.headArrow} onPress={prevChapter} accessibilityLabel="Previous chapter">
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M15 5l-7 7 7 7" stroke={theme.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                  </Pressable>
                  <Pressable style={styles.headTitle} onPress={() => setOpenSheet('passage')}>
                    <Text style={{ color: theme.text, fontFamily: FONTS.serifSemiBold, fontSize: 15 }} numberOfLines={1}>Read {bible[s.scrBook].n} {s.scrChapter + 1}</Text>
                    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none"><Path d="M6 9l6 6 6-6" stroke={theme.text} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                  </Pressable>
                  <Pressable hitSlop={8} style={styles.headArrow} onPress={nextChapter} accessibilityLabel="Next chapter">
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M9 5l7 7-7 7" stroke={theme.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                  </Pressable>
                </View>
                <ScrollView
                  ref={readerRef}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  contentContainerStyle={styles.readerContent}>
                  {chapterVerses.map((text, v) => {
                    const selected = s.scrVerse === v;
                    const saved = s.isSaved({ b: s.scrBook, c: s.scrChapter, v });
                    return (
                      <Pressable
                        key={v}
                        onPress={() => s.tapVerse(v)}
                        onLayout={(e) => { verseOffsets.current[v] = e.nativeEvent.layout.y; }}
                        style={[styles.verseRow, selected && { backgroundColor: theme.glow }]}>
                        <Text style={{ fontFamily: FONTS.serifRegular, fontSize: 16, lineHeight: 24, color: theme.text }}>
                          <Text style={{ fontFamily: FONTS.sansBold, fontSize: 10, color: theme.navactive }}>{v + 1} </Text>
                          <Text style={saved && !selected ? styles.savedUnderline : undefined}>{text}</Text>
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </>
        )}
      </View>
    );
  }

  return (
    <ScreenScroll contentStyle={{ paddingHorizontal: 20 }}>
      {header}

      {s.bibleReady && bible && tab === 'search' && (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="Search words, e.g. toward Jerusalem"
              placeholderTextColor={theme.muted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={runSearch}
            />
            <Pressable style={[styles.searchBtn, { backgroundColor: theme.accent }]} onPress={runSearch}>
              <Text style={{ color: theme.onaccent, fontSize: 13, fontWeight: '700' }}>Search</Text>
            </Pressable>
          </View>
          <Text style={{ color: theme.muted, fontSize: 12 }}>
            {searched == null
              ? 'Search every verse of the King James Bible.'
              : searched.total === 0
              ? `No verses contain "${searched.term}".`
              : searched.total > 100
              ? `${searched.total.toLocaleString()} verses contain "${searched.term}". Showing the first 100.`
              : `${searched.total} verse${searched.total === 1 ? '' : 's'} contain "${searched.term}".`}
          </Text>
          <View style={{ gap: 8 }}>
            {(searched?.hits ?? []).map((h) => (
              <Pressable
                key={`${h.b}-${h.c}-${h.v}`}
                style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => s.openVerse(h.b, h.c, h.v)}>
                <Text style={{ color: theme.navactive, fontSize: 11, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>{verseRef(bible, h)}</Text>
                <Text style={{ color: theme.text, fontFamily: FONTS.serifRegular, fontSize: 15, lineHeight: 22 }}>{verseText(bible, h)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {s.bibleReady && bible && tab === 'saved' && (
        <View style={{ gap: 8 }}>
          {s.savedVerses.length === 0 && (
            <Text style={{ color: theme.muted, fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>Saved verses will appear here.</Text>
          )}
          {s.savedVerses.map((loc, i) => (
            <View key={`${loc.b}-${loc.c}-${loc.v}-${i}`} style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.savedHeader}>
                <Text style={{ color: theme.navactive, fontSize: 11, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>{verseRef(bible, loc)}</Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <Pressable onPress={() => s.openVerse(loc.b, loc.c, loc.v)}><Text style={{ color: theme.muted, fontSize: 12, fontWeight: '600', padding: 6 }}>Open</Text></Pressable>
                  <Pressable onPress={() => s.removeSavedVerse(i)}><Text style={{ color: theme.muted, fontSize: 12, fontWeight: '600', padding: 6 }}>Remove</Text></Pressable>
                </View>
              </View>
              <Text style={{ color: theme.text, fontFamily: FONTS.serifRegular, fontSize: 15, lineHeight: 22 }}>{verseText(bible, loc)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', columnGap: 12 },
  title: { fontFamily: FONTS.serifSemiBold, fontSize: 20 },
  kjv: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' },
  tabRow: { flexDirection: 'row', gap: 8 },
  tabBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  sectionLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' },
  readRoot: { flex: 1 },
  readTop: { paddingHorizontal: 20, gap: 10 },
  readerWrap: { flex: 1, minHeight: 200, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  readerHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1 },
  headArrow: { width: 32, height: 28, alignItems: 'center', justifyContent: 'center' },
  headTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 28 },
  readerFill: { flex: 1, borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  hero: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 6 },
  heroTag: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cats: { flexDirection: 'row', gap: 6 },
  catBtn: { flex: 1, borderBottomWidth: 2, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  chipRow: { flexDirection: 'row', gap: 8 },
  chapterNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: { width: 44, height: 40, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chapterTitleBtn: { flex: 1, height: 40, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  chip: { flex: 1, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  reader: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  readerContent: { padding: 12, gap: 2 },
  verseRow: { padding: 8, borderRadius: 10 },
  savedUnderline: { textDecorationLine: 'underline' },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 64, borderWidth: 1, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14 },
  saveBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14 },
  useBtn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontSize: 14 },
  searchBtn: { borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  resultCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 4 },
  savedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
