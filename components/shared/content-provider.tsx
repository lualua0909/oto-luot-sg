"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { subscribeToContentTexts, type ContentTexts } from "@/lib/firebase/content";

const ContentContext = createContext<ContentTexts>({});

export function ContentProvider({
  initialTexts,
  children,
}: {
  initialTexts: ContentTexts;
  children: ReactNode;
}) {
  const [texts, setTexts] = useState<ContentTexts>(initialTexts);

  useEffect(() => subscribeToContentTexts(setTexts), []);

  return <ContentContext.Provider value={texts}>{children}</ContentContext.Provider>;
}

/** Text for `id`, falling back to the copy written in the component itself. */
export function useText(id: string, fallback: string) {
  const texts = useContext(ContentContext);
  return texts[id] ?? fallback;
}
