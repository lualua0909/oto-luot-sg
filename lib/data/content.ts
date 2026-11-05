import "server-only";
import { d1 } from "@/lib/server/d1";
import { CONTENT_DOC_ID, type ContentTexts } from "@/lib/content-texts";
export type { ContentTexts } from "@/lib/content-texts";

/** Editable frontend copy: one row 'site' in table `content`, `data.texts` = { id: text }. */
export async function getContentTexts(): Promise<ContentTexts> {
  try {
    const [row] = await d1<{ data: string }>("SELECT data FROM content WHERE id = ?", [CONTENT_DOC_ID]);
    return ((row ? JSON.parse(row.data) : {}).texts as ContentTexts) ?? {};
  } catch {
    return {};
  }
}

export async function saveContentText(id: string, value: string): Promise<void> {
  const key = String(id).slice(0, 200);
  await d1(
    `INSERT INTO content (id, data) VALUES (?, json_object('texts', json_object(?, ?)))
     ON CONFLICT(id) DO UPDATE SET data = json_set(data, '$.texts', json_patch(COALESCE(json_extract(data, '$.texts'), '{}'), json_object(?, ?)))`,
    [CONTENT_DOC_ID, key, value, key, value],
  );
}
