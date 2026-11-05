import { SITE } from "./constants";
import type { ShowroomSettings } from "./types";

export const SHOWROOM_SETTINGS_ID = "showroom";

export const DEFAULT_SHOWROOM_SETTINGS: ShowroomSettings = {
  name: SITE.name,
  fullName: SITE.fullName,
  description: SITE.description,
  slogan: SITE.slogan,
  phone: SITE.phone,
  phoneDisplay: SITE.phoneDisplay,
  contactPerson: SITE.contactPerson,
  taxCode: SITE.taxCode,
  email: SITE.email,
  address: SITE.address,
  mapEmbedUrl: SITE.mapEmbedUrl,
  facebook: SITE.facebook,
  zalo: SITE.zalo,
  tiktok1: SITE.tiktok1,
  tiktok2: SITE.tiktok2,
  googleBusinessUrl: SITE.googleBusinessUrl,
};

export function parseShowroomSettings(data?: Record<string, unknown>): ShowroomSettings {
  // Empty values saved from admin must not wipe out the defaults.
  const filled = Object.fromEntries(
    Object.entries(data ?? {}).filter(([, value]) => value !== "" && value != null)
  );
  return { ...DEFAULT_SHOWROOM_SETTINGS, ...filled } as ShowroomSettings;
}

