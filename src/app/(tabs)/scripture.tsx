import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
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

const PICKS_PER_PAGE = 2;

export default function ScriptureScreen() {
  const s = useJerusalem();
  const { setOpenSheet } = useSheets();
  const [tab, setTab] = useState<Tab>('read');
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState<{ hits: SearchHit[]; total: number; term: string } | null>(null);

  const theme = s.theme;
  const bible = s.bible;
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // The reader is a small fixed area at the top that scrolls inside itself.
  const readerHeight = Math.round(Math.max(170, Math.min(260, windowHeight * 0.26)));
  const [group, setGroup] = useState(0);
  const [page, setPage] = useState(0);
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

  const picks = HIGHLIGHTS[group].refs;
  const pageCount = Math.ceil(picks.length / PICKS_PER_PAGE);
  const pagePicks = picks.slice(page * PICKS_PER_PAGE, page * PICKS_PER_PAGE + PICKS_PER_PAGE);
  const openPick = (name: string, c: number, v: number) => {
    if (!bible) return;
    const b = bible.findIndex((x) => x.n === name);
    if (b >= 0) s.openVerse(b, c - 1, v - 1);
  };
  const selectGroup = (i: number) => {
    setGroup(i);
    setPage(0);
    const [name, c, v] = HIGHLIGHTS[i].refs[0];
    openPick(name, c, v);
  };

  if (tab === 'read') {
    return (
      <View style={[styles.readRoot, { backgroundColor: theme.bg }]}>
        <ScrollView
          contentContainerStyle={[styles.readContent, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}>
          {header}

          {s.bibleReady && bible && (
            <>
              <View style={[styles.reader, { height: readerHeight, backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.readerHead, { borderBottomColor: theme.border }]}>
                  <Pressable hitSlop={8} style={styles.headArrow} onPress={prevChapter} accessibilityLabel="Previous chapter">
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"><Path d="M15 5l-7 7 7 7" stroke={theme.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                  </Pressable>
                  <Pressable style={styles.headTitle} onPress={() => setOpenSheet('passage')}>
                    <Text style={{ color: theme.text, fontFamily: FONTS.serifSemiBold, fontSize: 14 }} numberOfLines={1}>{bible[s.scrBook].n} {s.scrChapter + 1}</Text>
                    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none"><Path d="M6 9l6 6 6-6" stroke={theme.text} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                  </Pressable>
                  <Pressable hitSlop={8} style={styles.headArrow} onPress={nextChapter} accessibilityLabel="Next chapter">
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"><Path d="M9 5l7 7-7 7" stroke={theme.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
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

              <View style={styles.cats}>
                {HIGHLIGHTS.map((g, i) => {
                  const active = i === group;
                  return (
                    <Pressable
                      key={g.label}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      style={[styles.catBtn, { backgroundColor: active ? theme.accent : theme.surface, borderColor: active ? theme.accent : theme.border }]}
                      onPress={() => selectGroup(i)}>
                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ color: active ? theme.onaccent : theme.text, fontSize: 11.5, fontWeight: '800' }}>{g.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ gap: 8 }}>
                {pagePicks.map(([name, c, v]) => {
                  const b = bible.findIndex((x) => x.n === name);
                  const active = b === s.scrBook && c - 1 === s.scrChapter && v - 1 === s.scrVerse;
                  return (
                    <Pressable
                      key={`${name}${c}${v}`}
                      accessibilityState={{ selected: active }}
                      style={[styles.pickCard, { backgroundColor: theme.card, borderColor: active ? theme.accent : theme.border, borderWidth: active ? 2 : 1 }]}
                      onPress={() => openPick(name, c, v)}>
                      <Text style={{ color: theme.navactive, fontSize: 10.5, letterSpacing: 1, fontWeight: '800', textTransform: 'uppercase' }}>
                        {name === 'Psalms' ? 'Psalm' : name} {c}:{v}
                      </Text>
                      <Text numberOfLines={2} style={{ color: theme.text, fontFamily: FONTS.serifRegular, fontSize: 14, lineHeight: 20 }}>
                        {b >= 0 ? verseText(bible, { b, c: c - 1, v: v - 1 }) : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.pager}>
                <Pressable
                  disabled={page === 0}
                  hitSlop={8}
                  style={[styles.pagerBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: page === 0 ? 0.35 : 1 }]}
                  onPress={() => setPage((p) => Math.max(0, p - 1))}
                  accessibilityLabel="Previous verses">
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"><Path d="M15 5l-7 7 7 7" stroke={theme.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                </Pressable>
                <View style={{ alignItems: 'center', gap: 5 }}>
                  <Text style={{ color: theme.muted, fontSize: 11.5, fontWeight: '700' }}>
                    {page * PICKS_PER_PAGE + 1}–{Math.min((page + 1) * PICKS_PER_PAGE, picks.length)} of {picks.length}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 5 }}>
                    {Array.from({ length: pageCount }, (_, i) => (
                      <View key={i} style={[styles.dot, { backgroundColor: i === page ? theme.accent : 'rgba(43,43,43,0.25)' }]} />
                    ))}
                  </View>
                </View>
                <Pressable
                  disabled={page >= pageCount - 1}
                  hitSlop={8}
                  style={[styles.pagerBtn, { backgroundColor: theme.card, borderColor: theme.border, opacity: page >= pageCount - 1 ? 0.35 : 1 }]}
                  onPress={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  accessibilityLabel="Next verses">
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"><Path d="M9 5l7 7-7 7" stroke={theme.text} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>

        {s.bibleReady && bible && (
          <View style={[styles.anchor, { backgroundColor: theme.bg }]}>
            <View style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {hasSelection ? (
                <>
                  <Text style={{ flex: 1, color: theme.text, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>{selectionRef}</Text>
                  <Pressable style={[styles.saveBtn, { borderColor: theme.border }]} onPress={() => s.toggleSaveVerse({ b: s.scrBook, c: s.scrChapter, v: s.scrVerse! })}>
                    <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{selSaved ? 'Saved' : 'Save'}</Text>
                  </Pressable>
                  <Pressable style={[styles.useBtn, { backgroundColor: theme.accent }]} onPress={s.useInPrayer}>
                    <Text style={{ color: theme.onaccent, fontSize: 13, fontWeight: '700' }}>Use in Prayer</Text>
                  </Pressable>
                </>
              ) : (
                <Text style={{ flex: 1, fontSize: 13, color: theme.muted, textAlign: 'center' }}>Tap a verse to save it or use it in prayer</Text>
              )}
            </View>
          </View>
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
  readContent: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  cats: { flexDirection: 'row', gap: 6 },
  catBtn: { flex: 1, borderWidth: 1, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  pickCard: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, gap: 3, minHeight: 72 },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pagerBtn: { width: 40, height: 30, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  readerHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6, borderBottomWidth: 1 },
  headArrow: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 28 },
  anchor: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
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
