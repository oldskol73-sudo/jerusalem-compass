import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CONFIDENCE_LABEL, formatDistance, signedDelta } from '@/constants/jerusalem';
import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

export function DiagnosticsSheet() {
  const s = useJerusalem();
  const declination = s.magHeading != null ? signedDelta(s.magHeading, s.smoothedHeading) : 0;

  const rows: [string, string][] = [
    ['Latitude', s.lat.toFixed(4)],
    ['Longitude', s.lon.toFixed(4)],
    ['Location accuracy', s.locationAccuracyM != null ? `${Math.round(s.locationAccuracyM)} m` : 'N/A'],
    ['Location source', s.locationSource],
    ['Location permission', s.locationPermission],
    ['Magnetic heading', s.magHeading != null ? `${Math.round(s.magHeading)}°` : 'N/A'],
    ['True heading', `${Math.round(s.smoothedHeading)}°`],
    ['Heading available', s.headingAvailable ? 'Yes (device sensor)' : 'No (simulated)'],
    ['Magnetic declination', `${declination >= 0 ? '+' : ''}${declination.toFixed(1)}°`],
    ['Jerusalem bearing', `${Math.round(s.bearingDeg)}°`],
    ['Relative angle', `${Math.round(s.relativeAngle)}°`],
    ['Distance', formatDistance(s.distanceKm)],
    ['Alignment state', s.alignmentState],
    ['Location confidence', CONFIDENCE_LABEL[s.locConf]],
    ['Heading confidence', CONFIDENCE_LABEL[s.headConf]],
    ['Overall confidence', CONFIDENCE_LABEL[s.overallConf]],
    ['Calibration status', s.calibrationStatus],
    ['JOE version', 'JOE 0.2.0'],
    ['Last update', s.lastUpdate ? new Date(s.lastUpdate).toLocaleTimeString() : 'N/A'],
  ];

  return (
    <View style={{ gap: 0 }}>
      <Text style={[styles.title, { color: s.theme.text, marginBottom: 12 }]}>JOE diagnostics</Text>
      <View style={{ borderTopWidth: 1, borderTopColor: s.theme.border }}>
        {rows.map(([label, value]) => (
          <View key={label} style={[styles.row, { borderBottomColor: s.theme.border }]}>
            <Text style={{ color: s.theme.muted, fontSize: 12.5 }}>{label}</Text>
            <Text style={{ color: s.theme.text, fontWeight: '600', fontSize: 12.5, maxWidth: '60%', textAlign: 'right' }}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.sansBold, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1 },
});
