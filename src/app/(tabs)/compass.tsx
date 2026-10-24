import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/app-text';
import { CompassDial } from '@/components/compass-dial';
import { GhostButton } from '@/components/ghost-button';
import { ScreenScroll } from '@/components/screen-scroll';
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
  const [distanceMi, distanceKm] = formatDistance(s.distanceKm).split(' · ');
  const showTurnDegree = s.alignmentState === 'turn-left' || s.alignmentState === 'turn-right';

  return (
    <ScreenScroll contentStyle={{ paddingHorizontal: 20 }}>
      <Text style={[styles.title, { color: s.theme.text }]}>Compass</Text>
      <Text style={[styles.badge, { color: s.theme.muted }]}>{locBadge}</Text>

      <CompassDial />

      <View style={styles.readout}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
          <Text style={{ fontSize: 34, fontWeight: '800', color: s.isAligned ? s.theme.gold : s.theme.text }}>
            {Math.round(s.smoothedHeading)}°
          </Text>
          <Text style={{ fontSize: 19, fontWeight: '700', color: s.theme.muted }}>{compassPointFor(s.smoothedHeading)}</Text>
        </View>
        <Text style={{ fontSize: 12, color: s.theme.muted, textAlign: 'center' }}>
          {dms(s.lat, 'N', 'S')}  ·  {dms(s.lon, 'E', 'W')}
        </Text>
      </View>

      <View style={{ alignItems: 'center', gap: 3 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: s.theme.text }}>{s.alignmentLabel}</Text>
        {showTurnDegree && (
          <Text style={{ fontSize: 13, color: s.theme.muted }}>{Math.round(Math.abs(s.relativeAngle))}° to align</Text>
        )}
      </View>

      <View style={[styles.statRow, { backgroundColor: s.theme.dialbase, borderColor: s.theme.brassring }]}>
        <Stat label="Bearing" value={`${Math.round(s.bearingDeg)}°`} theme={s.theme} border />
        <Stat label="Distance" value={distanceMi} sub={distanceKm} theme={s.theme} border />
        <Stat label="Confidence" value={CONFIDENCE_LABEL[s.overallConf]} theme={s.theme} />
      </View>

      <View style={[styles.infoCard, { backgroundColor: s.theme.card, borderColor: s.theme.border }]}>
        <InfoRow label="North source" value={s.headingAvailable ? 'True North • Approx' : 'Simulated heading'} theme={s.theme} border />
        <InfoRow label="Location quality" value={CONFIDENCE_LABEL[s.locConf]} theme={s.theme} border />
        <InfoRow label="Heading quality" value={CONFIDENCE_LABEL[s.headConf]} theme={s.theme} />
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

type Theme = ReturnType<typeof useJerusalem>['theme'];

function Stat({ label, value, sub, theme, border }: { label: string; value: string; sub?: string; theme: Theme; border?: boolean }) {
  return (
    <View style={[styles.stat, border && { borderRightWidth: 1, borderRightColor: theme.border }]}>
      <Text style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: theme.muted, textAlign: 'center' }} numberOfLines={1}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.dialtext, textAlign: 'center' }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{value}</Text>
      <Text style={{ fontSize: 11, color: theme.muted, textAlign: 'center', minHeight: 14 }} numberOfLines={1}>{sub ?? ' '}</Text>
    </View>
  );
}

function InfoRow({ label, value, theme, border }: { label: string; value: string; theme: Theme; border?: boolean }) {
  return (
    <View style={[styles.infoRow, border && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <Text style={{ fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.muted }}>{label}</Text>
      <Text style={{ flexShrink: 1, fontSize: 13, fontWeight: '700', color: theme.text, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.serifSemiBold, fontSize: 20, textAlign: 'center' },
  badge: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },
  readout: { alignItems: 'center', gap: 2 },
  statRow: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  stat: { flex: 1, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', gap: 2 },
  infoCard: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 12 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ghostHalf: { flexBasis: '47%', flexGrow: 1 },
  beginBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
});
