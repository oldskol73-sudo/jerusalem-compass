import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';

/** Largest factor system "larger text" settings may scale app text by, so layouts keep their spacing. */
export const MAX_FONT_SCALE = 1.25;

/** Drop-in replacement for react-native's Text that caps accessibility font scaling. */
export function Text(props: TextProps) {
  return <RNText maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />;
}
