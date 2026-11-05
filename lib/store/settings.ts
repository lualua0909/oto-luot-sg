import { adminSaveShowroomSettings, getShowroomSettingsAction } from "@/lib/actions";
import { unwrap } from "@/lib/action-result";
import type { ShowroomSettings } from "@/lib/types";
import { idToken, liveValue } from "./session";
export { DEFAULT_SHOWROOM_SETTINGS, SHOWROOM_SETTINGS_ID } from "@/lib/showroom-settings";

const live = liveValue(getShowroomSettingsAction);

export const getShowroomSettings = () => getShowroomSettingsAction();

export function subscribeToShowroomSettings(callback: (settings: ShowroomSettings) => void, onError?: (error: Error) => void) {
  return live.subscribe(callback, onError);
}

export async function saveShowroomSettings(settings: ShowroomSettings): Promise<void> {
  await unwrap(adminSaveShowroomSettings(await idToken(), settings));
  await live.notify();
}
