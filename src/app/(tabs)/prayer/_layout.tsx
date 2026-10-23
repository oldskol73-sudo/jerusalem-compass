import { Stack } from 'expo-router';
import React from 'react';

export default function PrayerStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
