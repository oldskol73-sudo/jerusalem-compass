import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useJerusalem } from '@/state/jerusalem-store';

export function BottomSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const { theme } = useJerusalem();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={[styles.panel, { backgroundColor: theme.sheet }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.grabber, { backgroundColor: theme.border }]} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.45)',
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '78%',
    paddingTop: 10,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },
});
