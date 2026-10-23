import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CompassDial } from '@/components/compass-dial';
import { GhostButton } from '@/components/ghost-button';
import { ScreenScroll } from '@/components/screen-scroll';
import { SectionCard } from '@/components/section-card';
import { FONTS } from '@/constants/fonts';
import { CONFIDENCE_LABEL, compassPointFor, dms, formatDistance } from '@/constants/jerusalem';
import { useJerusalem } from '@/state/jerusalem-store';
import { useSheets } from '@/state/sheets-store';

export default function CompassScreen() {
  const s = useJerusalem();
  const { setOpenSheet } = useSheets();

  const locBadge = s.locationSource === 'gps' ? 'Live location'
    : s.locationSource === 'manual' ? `Manual: ${s.locationLabel}`
    : `Demo location: ${s.locationLabel}`;
  const showTurnDegree = s.alignmentState === 'turn-left' || s.alignmentState === 'turn-right';

  return (
    <ScreenScroll contentStyle={{ paddingHorizontal: 20 }}>
      <Text style={[styles.title, { color: s.theme.text }]}>Compass</Text>
      <Text style={[styles.badge, { color: s.theme.muted }]}>{locBadge}</Text>

      <CompassDial />

      <View style={styles.readoutRow}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontSize: 34, fontWeight: '800', color: s.isAligned ? s.theme.gold : s.theme.text }}>
            {Math.round(s.smoothedHeading)}°
          </Text>
          <Text style={{ fontSize: 19, fontWeight: '700', color: s.theme.muted }}>{compassPointFor(s.smoothedHeading)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, color: s.theme.muted }}>{dms(s.lat, 'N', 'S')}</Text>
          <Text style={{ fontSize: 12, color: s.theme.muted }}>{dms(s.lon, 'E', 'W')}</Text>
        </View>
      </View>

      <View style={{ alignItems: 'center', gap: 3 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: s.theme.text }}>{s.alignmentLabel}</Text>
        {showTurnDegree && (
          <Text style={{ fontSize: 13, color: s.theme.muted }}>{Math.round(Math.abs(s.relativeAngle))}° to align</Text>
        )}
      </View>

      <View style={[styles.statRow, { backgroundColor: s.theme.dialbase, borderColor: s.theme.brassring }]}>
        <Stat label="Bearing" value={`${Math.round(s.bearingDeg)}°`} theme={s.theme} border />
        <Stat label="Distance" value={formatDistance(s.distanceKm)} theme={s.theme} border />
        <Stat label="Confidence" value={CONFIDENCE_LABEL[s.overallConf]} theme={s.theme} />
      </View>

      <View style={styles.grid2}>
        <SectionCard style={styles.gridCard}>
          <Text style={[styles.badge, { color: s.theme.muted }]}>North source</Text>
          <Text style={{ color: s.theme.text, fontWeight: '700', fontSize: 13, marginTop: 2 }}>
            {s.headingAvailable ? 'True North • Approx' : 'Simulated heading'}
          </Text>
        </SectionCard>
        <SectionCard style={styles.gridCard}>
          <Text style={[styles.badge, { color: s.theme.muted }]}>Location quality</Text>
          <Text style={{ color: s.theme.text, fontWeight: '700', fontSize: 13, marginTop: 2 }}>{CONFIDENCE_LABEL[s.locConf]}</Text>
        </SectionCard>
        <SectionCard style={styles.gridCard}>
          <Text style={[styles.badge, { color: s.theme.muted }]}>Heading quality</Text>
          <Text style={{ color: s.theme.text, fontWeight: '700', fontSize: 13, marginTop: 2 }}>{CONFIDENCE_LABEL[s.headConf]}</Text>
        </SectionCard>
      </View>

      <Text style={{ textAlign: 'center', fontSize: 12, color: s.theme.muted }}>
        Overall confidence: <Text style={{ color: s.theme.text, fontWeight: '700' }}>{CONFIDENCE_LABEL[s.overallConf]}</Text>
      </Text>

      <View style={styles.grid2}>
        <GhostButton label="Refresh location" onPress={s.retryLocationPermission} style={styles.ghostHalf} />
        <GhostButton label="Calibration" onPress={() => setOpenSheet('calibration')} style={styles.ghostHalf} />
        <GhostButton label="Manual location" onPress={() => setOpenSheet('manual')} style={styles.ghostHalf} />
        <GhostButton label="Diagnostics" onPress={() => setOpenSheet('diagnostics')} style={styles.ghostHalf} />
      </View>

      <Pressable style={[styles.beginBtn, { backgroundColor: s.theme.accent }]} onPress={() => router.push('/(tabs)/prayer')}>
        <Text style={{ color: s.theme.onaccent, fontWeight: '700', fontSize: 16 }}>Begin Prayer</Text>
      </Pressable>
    </ScreenScroll>
  );
}

function Stat({ label, value, theme, border }: { label: string; value: string; theme: ReturnType<typeof useJerusalem>['theme']; border?: boolean }) {
  return (
    <View style={[styles.stat, border && { borderRightWidth: 1, borderRightColor: theme.border }]}>
      <Text style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: theme.muted }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.dialtext, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.serifSemiBold, fontSize: 20 },
  badge: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },
  readoutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  statRow: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  stat: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: { flexBasis: '31%', flexGrow: 1 },
  ghostHalf: { flexBasis: '47%', flexGrow: 1 },
  beginBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
});
