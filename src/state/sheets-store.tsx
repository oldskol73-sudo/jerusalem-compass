import React, { createContext, useContext, useState } from 'react';

export type SheetName = 'manual' | 'calibration' | 'music' | 'about' | 'diagnostics' | 'passage' | null;

type Ctx = {
  openSheet: SheetName;
  setOpenSheet: (s: SheetName) => void;
};

const SheetsContext = createContext<Ctx | null>(null);

export function SheetsProvider({ children }: { children: React.ReactNode }) {
  const [openSheet, setOpenSheet] = useState<SheetName>(null);
  return <SheetsContext.Provider value={{ openSheet, setOpenSheet }}>{children}</SheetsContext.Provider>;
}

export function useSheets() {
  const ctx = useContext(SheetsContext);
  if (!ctx) throw new Error('useSheets must be used within SheetsProvider');
  return ctx;
}
