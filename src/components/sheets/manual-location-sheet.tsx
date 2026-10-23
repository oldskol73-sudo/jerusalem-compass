import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

export function ManualLocationSheet({ onClose }: { onClose: () => void }) {
  const { theme, setManualLocation, applyPreset } = useJerusalem();
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const latN = parseFloat(lat);
    const lonN = parseFloat(lon);
    if (Number.isNaN(latN) || latN < -90 || latN > 90) return setError('Enter a latitude between -90 and 90.');
    if (Number.isNaN(lonN) || lonN < -180 || lonN > 180) return setError('Enter a longitude between -180 and 180.');
    setError(null);
    setManualLocation(latN, lonN, 'Manual location');
    onClose();
  };

  const presets: { key: 'ny' | 'la' | 'london' | 'joburg' | 'sydney'; label: string }[] = [
    { key: 'ny', label: 'New York' },
    { key: 'la', label: 'Los Angeles' },
    { key: 'london', label: 'London' },
    { key: 'joburg', label: 'Johannesburg' },
    { key: 'sydney', label: 'Sydney' },
  ];

  return (
    <View style={{ gap: 14 }}>
      <Text style={[styles.title, { color: theme.text }]}>Manual location</Text>
      <Text style={{ color: theme.muted, fontSize: 12, lineHeight: 18 }}>
        Using a manually selected location. GPS precision is not implied for a city-center coordinate.
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder="Latitude"
          placeholderTextColor={theme.muted}
          keyboardType="numbers-and-punctuation"
          value={lat}
          onChangeText={setLat}
        />
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          placeholder="Longitude"
          placeholderTextColor={theme.muted}
          keyboardType="numbers-and-punctuation"
          value={lon}
          onChangeText={setLon}
        />
      </View>
      {error && <Text style={{ color: theme.gold, fontSize: 12 }}>{error}</Text>}
      <Pressable style={[styles.submit, { backgroundColor: theme.accent }]} onPress={submit}>
        <Text style={{ color: theme.onaccent, fontWeight: '700', fontSize: 14 }}>Use this location</Text>
      </Pressable>
      <Text style={{ color: theme.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>Presets</Text>
      <View style={styles.presetGrid}>
        {presets.map((p) => (
          <Pressable
            key={p.key}
            style={[styles.preset, { borderColor: theme.border }]}
            onPress={() => { applyPreset(p.key); onClose(); }}>
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.sansBold, fontSize: 16 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 12, fontSize: 14 },
  submit: { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: { flexBasis: '48%', borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
