import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const dir = path.join(process.cwd(), "public/images");
  const [logo, cover] = await Promise.all([
    readFile(path.join(dir, "logo.png")),
    readFile(path.join(dir, "og-cover.jpg")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const coverSrc = `data:image/jpeg;base64,${cover.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        <img src={coverSrc} width={1200} height={630} style={{ position: "absolute", objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.72)",
          }}
        >
          <img src={logoSrc} width={900} height={676} />
        </div>
      </div>
    ),
    size,
  );
}
