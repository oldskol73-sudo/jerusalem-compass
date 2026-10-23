import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
  SourceSerif4_500Medium,
  SourceSerif4_600SemiBold,
  SourceSerif4_600SemiBold_Italic,
} from '@expo-google-fonts/source-serif-4';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrayerSessionOverlay } from '@/components/prayer-session-overlay';
import { ReminderBanner } from '@/components/reminder-banner';
import { SheetsHost } from '@/components/sheets-host';
import { FONTS } from '@/constants/fonts';
import { JerusalemProvider } from '@/state/jerusalem-store';
import { SheetsProvider } from '@/state/sheets-store';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [FONTS.serifRegular]: SourceSerif4_400Regular,
    [FONTS.serifMedium]: SourceSerif4_500Medium,
    [FONTS.serifSemiBold]: SourceSerif4_600SemiBold,
    [FONTS.serifItalic]: SourceSerif4_400Regular_Italic,
    [FONTS.serifItalicSemiBold]: SourceSerif4_600SemiBold_Italic,
    [FONTS.sans]: Manrope_400Regular,
    [FONTS.sansMedium]: Manrope_500Medium,
    [FONTS.sansSemiBold]: Manrope_600SemiBold,
    [FONTS.sansBold]: Manrope_700Bold,
    [FONTS.sansExtraBold]: Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <JerusalemProvider>
          <SheetsProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <PrayerSessionOverlay />
            <SheetsHost />
            <ReminderBanner />
          </SheetsProvider>
        </JerusalemProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
