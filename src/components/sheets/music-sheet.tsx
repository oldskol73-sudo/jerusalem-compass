import { openURL } from 'expo-linking';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useJerusalem } from '@/state/jerusalem-store';

const APPS: { name: string; url: string | null }[] = [
  { name: 'Apple Music', url: 'https://music.apple.com' },
  { name: 'Spotify', url: 'https://open.spotify.com' },
  { name: 'YouTube Music', url: 'https://music.youtube.com' },
  { name: 'Amazon Music', url: 'https://music.amazon.com' },
  { name: 'None', url: null },
];

export function MusicSheet({ onClose }: { onClose: () => void }) {
  const { theme, musicApp, setMusicApp } = useJerusalem();
  return (
    <View style={{ gap: 12 }}>
      <Text style={[styles.title, { color: theme.text }]}>Music and Audio</Text>
      <Text style={{ color: theme.muted, fontSize: 12 }}>Choose a service to play ambient sound during prayer.</Text>
      <View>
        {APPS.map((app, i) => (
          <Pressable
            key={app.name}
            style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: i < APPS.length - 1 ? 1 : 0 }]}
            onPress={() => {
              if (app.url) openURL(app.url).catch(() => {});
              setMusicApp(app.name);
              onClose();
            }}>
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: musicApp === app.name ? '700' : '400' }}>{app.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: FONTS.sansBold, fontSize: 16 },
  row: { paddingVertical: 14 },
});
