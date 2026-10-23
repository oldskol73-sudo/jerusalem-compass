import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

export function AboutSheet({ onClose }: { onClose: () => void }) {
  const { theme } = useJerusalem();
  return (
    <Pressable onPress={onClose} style={{ gap: 14 }}>
      <Text style={[styles.title, { color: theme.text }]}>About Face Jerusalem</Text>
      <View style={{ gap: 14 }}>
        <Text style={[styles.body, { color: theme.text }]}>
          Face Jerusalem is a prayer and orientation app designed to help believers determine the direction of
          Jerusalem from virtually anywhere in the world and incorporate that direction into their personal prayer
          experience.
        </Text>
        <Text style={[styles.body, { color: theme.text }]}>
          Inspired by Daniel 6:10, where Daniel opened his windows toward Jerusalem and prayed three times a day,
          Face Jerusalem combines modern location and compass technology with a simple, reverent prayer environment.
        </Text>
        <Text style={[styles.body, { color: theme.text }]}>
          The app provides accurate Jerusalem direction, guided prayer sessions, prayer reminders, private
          journaling, Scripture integration, and direct access to the King James Bible for continued reading and
          study.
        </Text>
        <Text style={[styles.body, { color: theme.text }]}>Face Jerusalem is designed around a simple purpose:</Text>
        <Text style={{ fontFamily: FONTS.serifItalic, color: theme.muted, fontSize: 14 }}>
          Know the direction. Face Jerusalem. Pray. Give thanks. Continue as aforetime.
        </Text>
      </View>
      <Image source={require('@/assets/images/app/tsp-brand-wide.jpg')} style={styles.brandPlate} resizeMode="cover" />
      <Text style={{ color: theme.muted, fontSize: 11, textAlign: 'center' }}>Tap anywhere to close</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.serifSemiBold, fontSize: 17 },
  body: { fontSize: 14, lineHeight: 21 },
  brandPlate: { width: '100%', aspectRatio: 1000 / 562, borderRadius: 14 },
});
