import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/app-text';
import { useJerusalem } from '@/state/jerusalem-store';

type Props = {
  label: string;
  onPress: () => void;
  active?: boolean;
  style?: object;
};

export function GhostButton({ label, onPress, active, style }: Props) {
  const { theme } = useJerusalem();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: active ? theme.accent : 'transparent',
          borderColor: active ? theme.accent : theme.border,
        },
        style,
      ]}>
      <Text style={[styles.label, { color: active ? theme.onaccent : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
