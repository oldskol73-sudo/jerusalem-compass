import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useJerusalem } from '@/state/jerusalem-store';

export function SectionCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { theme } = useJerusalem();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
});
