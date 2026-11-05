import "server-only";
import { d1 } from "@/lib/server/d1";
import { DEFAULT_SHOWROOM_SETTINGS, SHOWROOM_SETTINGS_ID, parseShowroomSettings } from "@/lib/showroom-settings";
import type { ShowroomSettings } from "@/lib/types";
export { DEFAULT_SHOWROOM_SETTINGS } from "@/lib/showroom-settings";

/** Showroom contact/social settings: row 'showroom' in table `settings`. */
export async function getShowroomSettings(): Promise<ShowroomSettings> {
  try {
    const [row] = await d1<{ data: string }>("SELECT data FROM settings WHERE id = ?", [SHOWROOM_SETTINGS_ID]);
    return parseShowroomSettings(row ? JSON.parse(row.data) : {});
  } catch {
    return DEFAULT_SHOWROOM_SETTINGS;
  }
}

export async function saveShowroomSettings(settings: ShowroomSettings): Promise<void> {
  const allowed = Object.keys(DEFAULT_SHOWROOM_SETTINGS);
  const clean = Object.fromEntries(Object.entries(settings).filter(([k, v]) => allowed.includes(k) && typeof v === "string"));
  await d1(
    "INSERT INTO settings (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = json_patch(data, excluded.data)",
    [SHOWROOM_SETTINGS_ID, JSON.stringify(clean)],
  );
}
