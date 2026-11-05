import { adminSaveContentText, getContentTextsAction } from "@/lib/actions";
import { unwrap } from "@/lib/action-result";
import type { ContentTexts } from "@/lib/content-texts";
import { idToken, liveValue } from "./session";
export { CONTENT_DOC_ID, type ContentTexts } from "@/lib/content-texts";

const live = liveValue(getContentTextsAction);

export function subscribeToContentTexts(callback: (texts: ContentTexts) => void) {
  // D1 unreachable: keep the in-code defaults.
  return live.subscribe(callback, () => callback({}));
}

export async function saveContentText(id: string, value: string): Promise<void> {
  await unwrap(adminSaveContentText(await idToken(), id, value));
  await live.notify();
}
