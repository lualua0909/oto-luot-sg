import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const cover = await readFile(path.join(process.cwd(), "public/images/og-cover.jpg"));
  const coverSrc = `data:image/jpeg;base64,${cover.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <img src={coverSrc} width={1200} height={630} style={{ objectFit: "cover" }} />
      </div>
    ),
    size,
  );
}
