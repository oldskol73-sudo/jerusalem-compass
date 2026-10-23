import { Tabs } from 'expo-router/js-tabs';
import React from 'react';

import { JerusalemTabBar } from '@/components/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <JerusalemTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="compass" />
      <Tabs.Screen name="prayer" />
      <Tabs.Screen name="scripture" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
