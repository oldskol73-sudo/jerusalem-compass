import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { PrayerRing } from '@/components/prayer-ring';
import { FONTS } from '@/constants/fonts';
import { verseRef, verseText } from '@/lib/bible';
import { useJerusalem } from '@/state/jerusalem-store';

export function PrayerSessionOverlay() {
  const s = useJerusalem();
  const insets = useSafeAreaInsets();
  const visible = s.sessionPhase === 'active' || s.sessionPhase === 'paused' || s.sessionPhase === 'complete';
  if (!visible) return null;

  const theme = s.theme;
  const totalMs = s.prayerDuration * 60000;
  const elapsedMs = s.sessionPhase === 'active' ? s.sessionAccumMs + (Date.now() - s.sessionResumedAt) : s.sessionAccumMs;
  const remainMs = Math.max(0, totalMs - elapsedMs);
  const remSec = Math.ceil(remainMs / 1000);
  const periodName = s.prayerDuration === 5 ? 'Morning' : s.prayerDuration === 10 ? 'Afternoon' : 'Evening';
  const elapsedMin = Math.max(1, Math.round(elapsedMs / 60000));

  const attached = s.attachedVerse && s.bible ? {
    ref: verseRef(s.bible, s.attachedVerse),
    text: verseText(s.bible, s.attachedVerse),
  } : null;

  return (
    <Modal visible transparent={false} animationType="fade">
      <View style={[styles.root, { backgroundColor: theme.bg, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
        {s.sessionPhase === 'complete' ? (
          <View style={styles.completeWrap}>
            <Text style={[styles.amen, { color: theme.navactive }]}>Amen</Text>
            <Text style={[styles.giveThanks, { color: theme.text }]}>Give thanks.</Text>
            <Text style={{ color: theme.muted, fontSize: 14 }}>
              {elapsedMin} minute{elapsedMin === 1 ? '' : 's'} in prayer toward Jerusalem
            </Text>
            <Text style={[styles.quote, { color: theme.text }]}>
              &ldquo;and gave thanks before his God, as he did aforetime.&rdquo;
            </Text>
            <Text style={{ color: theme.navactive, fontSize: 11, letterSpacing: 1.2, fontWeight: '700', textTransform: 'uppercase' }}>
              Daniel 6:10
            </Text>
            <View style={{ flex: 1, minHeight: 24 }} />
            <Pressable
              style={[styles.outlineBtn, { borderColor: theme.navactive }]}
              onPress={() => { s.finishToJournal(); }}>
              <Text style={{ color: theme.navactive, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 }}>WRITE IN JOURNAL</Text>
            </Pressable>
            <Pressable style={[styles.filledBtn, { backgroundColor: theme.accent }]} onPress={s.finishSession}>
              <Text style={{ color: theme.onaccent, fontWeight: '700', fontSize: 16 }}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.activeWrap}>
            <View style={styles.header}>
              <Text style={{ color: theme.navactive, fontSize: 11, letterSpacing: 1.4, fontWeight: '700', textTransform: 'uppercase' }}>
                {periodName} prayer
              </Text>
              <Pressable onPress={s.endSession}>
                <Text style={{ color: theme.muted, fontSize: 13, fontWeight: '600' }}>End</Text>
              </Pressable>
            </View>

            <PrayerRing progress={elapsedMs / totalMs}>
              <Text style={[styles.timer, { color: theme.text }]}>
                {Math.floor(remSec / 60)}:{String(remSec % 60).padStart(2, '0')}
              </Text>
              <Text style={{ color: theme.muted, fontSize: 12 }}>
                {s.sessionPhase === 'paused' ? 'Paused' : `of ${s.prayerDuration} minutes`}
              </Text>
            </PrayerRing>

            <View style={[styles.alignCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.alignIcon, { borderColor: theme.brassring, shadowColor: theme.gold, shadowOpacity: s.isAligned ? 0.8 : 0, shadowRadius: 14 }]}>
                <Svg width={18} height={18} viewBox="0 0 24 24" style={{ transform: [{ rotate: `${s.relativeAngle}deg` }] }}>
                  <Path d="M12 3l5 15-5-3-5 3z" fill={theme.needle} />
                </Svg>
              </View>
              <View style={{ gap: 2 }}>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{s.alignmentLabel}</Text>
                <Text style={{ color: theme.muted, fontSize: 12 }}>
                  Jerusalem {Math.round(s.bearingDeg)}°
                </Text>
              </View>
            </View>

            {attached && (
              <View style={styles.verseWrap}>
                <Text style={[styles.verseText, { color: theme.text, fontFamily: FONTS.serifRegular }]}>&ldquo;{attached.text}&rdquo;</Text>
                <Text style={{ color: theme.navactive, fontSize: 11, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>{attached.ref}</Text>
              </View>
            )}

            <View style={{ flex: 1 }} />
            <Text style={{ color: theme.muted, fontSize: 12 }}>
              {s.silentMode ? 'Silent Mode on' : 'A gentle chime will sound at the end'}
            </Text>
            <Pressable
              style={[styles.outlineBtn, { borderColor: theme.navactive, width: '100%' }]}
              onPress={s.togglePause}>
              <Text style={{ color: theme.navactive, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 }}>
                {s.sessionPhase === 'paused' ? 'RESUME' : 'PAUSE'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  activeWrap: { flex: 1, alignItems: 'center', gap: 22 },
  completeWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 4 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timer: { fontFamily: FONTS.serifMedium, fontSize: 56 },
  alignCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14, width: '100%' },
  alignIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  verseWrap: { gap: 8, alignItems: 'center', paddingHorizontal: 4 },
  verseText: { fontSize: 16, lineHeight: 26, textAlign: 'center' },
  outlineBtn: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 16, alignItems: 'center', width: '100%' },
  filledBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', width: '100%' },
  amen: { fontSize: 11, letterSpacing: 1.4, fontWeight: '700', textTransform: 'uppercase' },
  giveThanks: { fontFamily: FONTS.serifSemiBold, fontSize: 34 },
  quote: { fontFamily: FONTS.serifItalic, fontSize: 16, lineHeight: 25, textAlign: 'center', maxWidth: 290, marginTop: 8 },
});
