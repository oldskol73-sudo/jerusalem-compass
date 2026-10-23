import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/app-text';
import Svg, { Path } from 'react-native-svg';

import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

export function BackLink({ label }: { label: string }) {
  const { theme } = useJerusalem();
  return (
    <Pressable onPress={() => router.back()} style={styles.backLink}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path d="M15 5l-7 7 7 7" stroke={theme.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text style={{ color: theme.muted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function ScreenTitle({ title, trailing }: { title: string; trailing?: React.ReactNode }) {
  const { theme } = useJerusalem();
  return (
    <View style={styles.titleRow}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 20,
  },
});
