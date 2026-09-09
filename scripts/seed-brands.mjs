/**
 * Seed logo các hãng xe vào Firestore collection "brands".
 * Logo lấy từ favicon chính chủ của từng hãng (Google favicon service),
 * upload lên Vercel Blob folder brands/.
 *
 * Chạy: node scripts/seed-brands.mjs
 */
import fs from "node:fs";
import { put } from "@vercel/blob";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const SERVICE_ACCOUNT = "voice-b-dbb5e-firebase-adminsdk-fbsvc-1d3189699f.json";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

// Domain chính chủ của từng hãng — favicon của các site này chính là logo.
const BRANDS = [
  { slug: "toyota", name: "Toyota", order: 1, domain: "toyota.com" },
  { slug: "honda", name: "Honda", order: 2, domain: "honda.com" },
  { slug: "hyundai", name: "Hyundai", order: 3, domain: "hyundai.com" },
  { slug: "kia", name: "Kia", order: 4, domain: "kia.com" },
  { slug: "mazda", name: "Mazda", order: 5, domain: "mazda.com" },
  { slug: "ford", name: "Ford", order: 6, domain: "ford.com" },
  { slug: "mitsubishi", name: "Mitsubishi", order: 7, domain: "mitsubishicars.com" },
  { slug: "suzuki", name: "Suzuki", order: 8, domain: "suzuki.com" },
  { slug: "chevrolet", name: "Chevrolet", order: 9, domain: "chevrolet.com" },
  { slug: "nissan", name: "Nissan", order: 10, domain: "nissan-global.com" },
  { slug: "vinfast", name: "VinFast", order: 11, domain: "vinfast.vn" },
  { slug: "mercedes", name: "Mercedes-Benz", order: 12, domain: "mercedes-benz.com" },
  { slug: "bmw", name: "BMW", order: 13, domain: "bmw.de" },
  { slug: "audi", name: "Audi", order: 14, domain: "audi.com" },
  { slug: "lexus", name: "Lexus", order: 15, domain: "lexus.com" },
  { slug: "land-rover", name: "Land Rover", order: 16, domain: "landrover.com" },
  { slug: "porsche", name: "Porsche", order: 17, domain: "porsche.com" },
  { slug: "peugeot", name: "Peugeot", order: 18, domain: "peugeot.com" },
];

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("thiếu BLOB_READ_WRITE_TOKEN trong .env.local");

  initializeApp({ credential: cert(JSON.parse(fs.readFileSync(SERVICE_ACCOUNT, "utf8"))) });
  const db = getFirestore();

  for (const { slug, name, order, domain } of BRANDS) {
    const res = await fetch(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
    if (!res.ok) {
      console.warn(`✗ ${name} — favicon lỗi ${res.status} (${domain}), bỏ qua logo.`);
      await db.collection("brands").doc(slug).set({ slug, name, order }, { merge: true });
      continue;
    }
    const type = res.headers.get("content-type") ?? "image/png";
    const ext = type.includes("jpeg") ? "jpg" : "png";
    const blob = await put(`brands/${slug}.${ext}`, Buffer.from(await res.arrayBuffer()), {
      access: "public",
      contentType: type,
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    await db.collection("brands").doc(slug).set({ slug, name, order, logoUrl: blob.url });
    console.log(`✓ ${name}  ${blob.url}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
