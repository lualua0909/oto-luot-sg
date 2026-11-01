import type { JsonLdNode } from "@/lib/structured-data/schema";

/**
 * Serialises JSON-LD safely for an inline <script>: escapes "<", ">", "&" and
 * the U+2028/U+2029 line separators so CMS text can never close the tag.
 */
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029");
}

/** Server component: one JSON-LD @graph per page. Drop duplicate @ids. */
export function JsonLd({ graph }: { graph: (JsonLdNode | null | undefined | false)[] }) {
  const seen = new Set<string>();
  const nodes = graph.filter((node): node is JsonLdNode => {
    if (!node) return false;
    const id = node["@id"];
    if (typeof id !== "string") return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  if (!nodes.length) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd({ "@context": "https://schema.org", "@graph": nodes }) }}
    />
  );
}
