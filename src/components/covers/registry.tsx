import React from 'react';

import { BearingCover } from '@/components/covers/bearing-cover';
import { NightSkyCover } from '@/components/covers/night-sky-cover';
import { OpenWindowCover } from '@/components/covers/open-window-cover';

export type CoverKey = 'night-sky' | 'open-window' | 'bearing';
export type CoverStyle = CoverKey | 'random';

export const COVERS: { key: CoverKey; label: string; Component: () => React.JSX.Element }[] = [
  { key: 'night-sky', label: 'Night Sky', Component: NightSkyCover },
  { key: 'open-window', label: 'Open Window', Component: OpenWindowCover },
  { key: 'bearing', label: 'Bearing', Component: BearingCover },
];

/** Which cover opens the app: one fixed cover, or a random one each launch. */
export const COVER_STYLE_KEY = 'fj_coverStyle';
/** Remembers the last random pick so the same cover is not shown twice in a row. */
export const LAST_COVER_KEY = 'fj_lastCover';

export function isCoverStyle(value: unknown): value is CoverStyle {
  return value === 'random' || COVERS.some((c) => c.key === value);
}
