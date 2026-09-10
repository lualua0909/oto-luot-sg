import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./client";

export const CONTENT_DOC_ID = "site";

/** Flat map of text id → text, e.g. { "home.hero.title": "Xe lướt chính chủ" }. */
export type ContentTexts = Record<string, string>;

const contentRef = doc(db, "content", CONTENT_DOC_ID);

function parseTexts(data?: Record<string, unknown>): ContentTexts {
  return (data?.texts as ContentTexts) ?? {};
}

/** Server-side read used to hydrate the first render without a flash of defaults. */
export async function getContentTexts(): Promise<ContentTexts> {
  const snap = await getDoc(contentRef);
  return parseTexts(snap.data());
}

export function subscribeToContentTexts(callback: (texts: ContentTexts) => void) {
  return onSnapshot(
    contentRef,
    (snap) => callback(parseTexts(snap.data())),
    () => {
      // Firestore unreachable or rules deny reads → keep the in-code defaults.
      callback({});
    }
  );
}

/** ADMIN: overwrite a single text. Firestore rules restrict this to role 0/1. */
export async function saveContentText(id: string, value: string): Promise<void> {
  await setDoc(contentRef, { texts: { [id]: value } }, { merge: true });
}
