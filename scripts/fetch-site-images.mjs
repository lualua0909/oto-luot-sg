/**
 * Tải ảnh tĩnh cho hero / trang giới thiệu / OG về public/images/.
 * Nguồn: ảnh tin đăng ô tô trên Chợ Tốt (dùng làm ảnh mẫu khi chưa có ảnh thật của showroom).
 *
 * Chạy: node scripts/fetch-site-images.mjs
 */
import fs from "node:fs";
import path from "node:path";

const OUT = "public/images";
// Mỗi ảnh lấy từ 1 tin khác nhau để 3 khung hero không bị trùng xe.
const TARGETS = [
  { file: "hero-car-1.jpg", ad: 0, img: 0 },
  { file: "hero-car-2.jpg", ad: 1, img: 1 },
  { file: "hero-car-3.jpg", ad: 2, img: 2 },
  { file: "about-showroom.jpg", ad: 3, img: 0 },
  { file: "about-team.jpg", ad: 4, img: 1 },
  { file: "og-cover.jpg", ad: 5, img: 0 },
];

const api = "https://gateway.chotot.com/v1/public/ad-listing?cg=2010&region_v2=13000&st=s,k&limit=12";
const ads = (await (await fetch(api, { headers: { "User-Agent": "Mozilla/5.0" } })).json()).ads ?? [];

fs.mkdirSync(OUT, { recursive: true });
for (const { file, ad, img } of TARGETS) {
  const src = ads[ad]?.images?.[img] ?? ads[ad]?.images?.[0];
  if (!src) {
    console.warn(`✗ ${file} — không có ảnh cho tin #${ad}`);
    continue;
  }
  const res = await fetch(src, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    console.warn(`✗ ${file} — lỗi ${res.status}`);
    continue;
  }
  fs.writeFileSync(path.join(OUT, file), Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${OUT}/${file}  ← ${ads[ad].subject}`);
}
