import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./client";
import { SITE } from "../constants";
import type { ShowroomSettings } from "../types";

export const SHOWROOM_SETTINGS_ID = "showroom";

export const DEFAULT_SHOWROOM_SETTINGS: ShowroomSettings = {
  name: SITE.name,
  fullName: SITE.fullName,
  description: SITE.description,
  slogan: SITE.slogan,
  phone: SITE.phone,
  phoneDisplay: SITE.phoneDisplay,
  contactPerson: SITE.contactPerson,
  email: SITE.email,
  address: SITE.address,
  mapEmbedUrl: SITE.mapEmbedUrl,
  facebook: SITE.facebook,
  zalo: SITE.zalo,
  tiktok1: SITE.tiktok1,
  tiktok2: SITE.tiktok2,
};

const settingsRef = doc(db, "settings", SHOWROOM_SETTINGS_ID);

function parseSettings(data?: Record<string, unknown>): ShowroomSettings {
  // Empty values saved from admin must not wipe out the defaults.
  const filled = Object.fromEntries(
    Object.entries(data ?? {}).filter(([, value]) => value !== "" && value != null)
  );
  return { ...DEFAULT_SHOWROOM_SETTINGS, ...filled } as ShowroomSettings;
}

export async function getShowroomSettings(): Promise<ShowroomSettings> {
  const snapshot = await getDoc(settingsRef);
  return parseSettings(snapshot.data());
}

export function subscribeToShowroomSettings(
  callback: (settings: ShowroomSettings) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    settingsRef,
    (snapshot) => callback(parseSettings(snapshot.data())),
    onError
  );
}

export async function saveShowroomSettings(settings: ShowroomSettings): Promise<void> {
  await setDoc(settingsRef, settings, { merge: true });
}
