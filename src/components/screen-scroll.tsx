import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useJerusalem } from '@/state/jerusalem-store';

export function ScreenScroll({
  children,
  contentStyle,
  noTopInset,
}: {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  noTopInset?: boolean;
}) {
  const { theme } = useJerusalem();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: noTopInset ? 0 : insets.top + 16 },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 28, gap: 18 },
});
