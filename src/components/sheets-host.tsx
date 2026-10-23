import React from 'react';

import { BottomSheet } from '@/components/bottom-sheet';
import { AboutSheet } from '@/components/sheets/about-sheet';
import { CalibrationSheet } from '@/components/sheets/calibration-sheet';
import { DiagnosticsSheet } from '@/components/sheets/diagnostics-sheet';
import { ManualLocationSheet } from '@/components/sheets/manual-location-sheet';
import { MusicSheet } from '@/components/sheets/music-sheet';
import { PassageSheet } from '@/components/sheets/passage-sheet';
import { useSheets } from '@/state/sheets-store';

export function SheetsHost() {
  const { openSheet, setOpenSheet } = useSheets();
  const close = () => setOpenSheet(null);

  return (
    <BottomSheet visible={openSheet != null} onClose={close}>
      {openSheet === 'manual' && <ManualLocationSheet onClose={close} />}
      {openSheet === 'calibration' && <CalibrationSheet onClose={close} />}
      {openSheet === 'music' && <MusicSheet onClose={close} />}
      {openSheet === 'about' && <AboutSheet onClose={close} />}
      {openSheet === 'diagnostics' && <DiagnosticsSheet />}
      {openSheet === 'passage' && <PassageSheet onClose={close} />}
    </BottomSheet>
  );
}
