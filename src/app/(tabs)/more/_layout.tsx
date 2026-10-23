import { Stack } from 'expo-router';
import React from 'react';

export default function MoreStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="jerusalem-info" />
    </Stack>
  );
}
