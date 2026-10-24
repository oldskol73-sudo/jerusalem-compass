import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { COVERS } from '@/components/covers/registry';

/** Shows one cover on demand from Settings. FIND JERUSALEM closes it and returns to Settings. */
export default function CoverPreviewScreen() {
  const { style } = useLocalSearchParams<{ style?: string }>();
  const cover = COVERS.find((c) => c.key === style) ?? COVERS[0];
  const { Component } = cover;
  return (
    <View style={{ flex: 1, backgroundColor: '#05070f' }}>
      <Component />
    </View>
  );
}
