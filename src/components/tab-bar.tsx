import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useJerusalem } from '@/state/jerusalem-store';

const ICONS: Record<string, (color: string) => React.ReactNode> = {
  index: (color) => (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11.5L12 4l8 7.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 10v9h12v-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  compass: (color) => (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.8} />
      <Path d="M15 9l-2 5-4 1.5 2-5.5z" fill={color} />
    </Svg>
  ),
  prayer: (color) => (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M8 20V10a4 4 0 018 0v10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 20h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  ),
  scripture: (color) => (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5.5c2-1 5-1 8 .5 3-1.5 6-1.5 8-.5v13c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M12 6v13" stroke={color} strokeWidth={1.6} />
    </Svg>
  ),
  more: (color) => (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Circle cx={5} cy={12} r={1.6} fill={color} />
      <Circle cx={12} cy={12} r={1.6} fill={color} />
      <Circle cx={19} cy={12} r={1.6} fill={color} />
    </Svg>
  ),
};

const LABELS: Record<string, string> = {
  index: 'Home', compass: 'Compass', prayer: 'Prayer', scripture: 'Scripture', more: 'More',
};

export function JerusalemTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme, sessionPhase } = useJerusalem();
  const insets = useSafeAreaInsets();

  if (sessionPhase) return null;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 6), borderTopColor: theme.border, backgroundColor: theme.navbg }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? theme.navactive : theme.navinactive;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.btn}
            accessibilityRole="button">
            {ICONS[route.name]?.(color)}
            <Text style={{ fontSize: 10.5, color, fontWeight: route.name === 'prayer' ? '700' : '400' }}>
              {LABELS[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
  },
  btn: { alignItems: 'center', gap: 2, paddingVertical: 6, paddingHorizontal: 4, minWidth: 48 },
});
