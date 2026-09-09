"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_SHOWROOM_SETTINGS, subscribeToShowroomSettings } from "@/lib/firebase/settings";
import type { ShowroomSettings } from "@/lib/types";

const ShowroomSettingsContext = createContext<ShowroomSettings>(DEFAULT_SHOWROOM_SETTINGS);

export function ShowroomSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ShowroomSettings>(DEFAULT_SHOWROOM_SETTINGS);

  useEffect(() => subscribeToShowroomSettings(setSettings), []);

  return <ShowroomSettingsContext.Provider value={settings}>{children}</ShowroomSettingsContext.Provider>;
}

export function useShowroomSettings() {
  return useContext(ShowroomSettingsContext);
}
