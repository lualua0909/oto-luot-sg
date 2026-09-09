/**
 * Seed data từ tin đăng ô tô trên Chợ Tốt:
 *   1. gọi API public ad-listing
 *   2. tải ảnh, upload lên Vercel Blob (folder cars/)
 *   3. ghi document vào Firestore collection "cars" bằng firebase-admin
 *
 * Chạy: node scripts/seed-chotot.mjs [số tin, mặc định 10]
 */
import fs from "node:fs";
import { put } from "@vercel/blob";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import slugify from "slugify";

const LIMIT = Number(process.argv[2] ?? 10);
const IMAGES_PER_CAR = 5;
const SERVICE_ACCOUNT = "voice-b-dbb5e-firebase-adminsdk-fbsvc-1d3189699f.json";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const FUEL = { 1: "Xăng", 2: "Dầu (Diesel)", 3: "Hybrid", 4: "Điện" };
const GEARBOX = { 1: "Số tự động", 2: "Số sàn" };

const BODY_BY_MODEL = {
  vios: "Sedan", accent: "Sedan", city: "Sedan", camry: "Sedan", civic: "Sedan",
  altis: "Sedan", cerato: "Sedan", k3: "Sedan", mazda3: "Sedan", "c300": "Sedan",
  "530i": "Sedan", es: "Sedan", attrage: "Sedan",
  "cr-v": "SUV (5 chỗ)", crv: "SUV (5 chỗ)", tucson: "SUV (5 chỗ)", "x-trail": "SUV (5 chỗ)",
  cx5: "SUV (5 chỗ)", "cx-5": "SUV (5 chỗ)", seltos: "SUV (5 chỗ)", corolla: "Sedan",
  everest: "SUV (7 chỗ)", fortuner: "SUV (7 chỗ)", santafe: "SUV (7 chỗ)",
  "santa fe": "SUV (7 chỗ)", sorento: "SUV (7 chỗ)", "cx-8": "SUV (7 chỗ)",
  ranger: "Bán tải", triton: "Bán tải", "hilux": "Bán tải", "d-max": "Bán tải",
  innova: "MPV", xpander: "MPV", carnival: "MPV", sedona: "MPV", veloz: "MPV",
  avanza: "MPV", ertiga: "MPV", stargazer: "MPV",
  morning: "Hatchback", i10: "Hatchback", vf3: "Hatchback", fadil: "Hatchback",
  swift: "Hatchback", brio: "Hatchback",
};

/** Đoán kiểu dáng xe từ tên model + tiêu đề (API listing không trả về field này). */
function guessBodyType(model, title) {
  const hay = `${model} ${title}`.toLowerCase();
  for (const [key, body] of Object.entries(BODY_BY_MODEL)) {
    if (hay.includes(key)) return body;
  }
  if (/bán tải|pickup/.test(hay)) return "Bán tải";
  if (/7 chỗ/.test(hay)) return "SUV (7 chỗ)";
  if (/suv/.test(hay)) return "SUV (5 chỗ)";
  return "Sedan";
}

function guessSeats(bodyType, title) {
  const m = title.match(/(\d+)\s*chỗ/);
  if (m) return Number(m[1]);
  if (bodyType === "SUV (7 chỗ)" || bodyType === "MPV") return 7;
  if (bodyType === "Van") return 16;
  return 5;
}

/** Body của tin Chợ Tốt hay có emoji + xuống dòng lung tung → tách thành gạch đầu dòng. */
function toHighlights(body) {
  return body
    .split("\n")
    .map((l) => l.replace(/[^\p{L}\p{N}\s.,%/()+-]/gu, "").replace(/\s+/g, " ").trim())
    .filter((l) => l.length >= 8 && l.length <= 80)
    .slice(0, 5);
}

function cleanDescription(body) {
  return body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

async function uploadFromUrl(url, slug, index) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`tải ảnh lỗi ${res.status}: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const blob = await put(`cars/${slug}-${index}.jpg`, buffer, {
    access: "public",
    contentType: res.headers.get("content-type") ?? "image/jpeg",
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return { url: blob.url, path: blob.pathname };
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("thiếu BLOB_READ_WRITE_TOKEN trong .env.local");

  initializeApp({ credential: cert(JSON.parse(fs.readFileSync(SERVICE_ACCOUNT, "utf8"))) });
  const db = getFirestore();

  const api = `https://gateway.chotot.com/v1/public/ad-listing?cg=2010&region_v2=13000&st=s,k&limit=${LIMIT}`;
  const ads = (await (await fetch(api, { headers: { "User-Agent": "Mozilla/5.0" } })).json()).ads ?? [];
  console.log(`Lấy được ${ads.length} tin.`);

  const now = Date.now();
  for (const [i, ad] of ads.entries()) {
    const title = ad.subject.trim();
    const brandName = ad.carbrand_name ?? "Khác";
    const model = ad.carmodel_name ?? "";
    const year = Number(ad.mfdate) || new Date().getFullYear();
    const slug = `${slugify(title, { lower: true, locale: "vi", strict: true })}-${year}-${now + i}`.slice(0, 90);
    const bodyType = guessBodyType(model, title);

    const images = [];
    for (const [j, src] of (ad.images ?? []).slice(0, IMAGES_PER_CAR).entries()) {
      images.push(await uploadFromUrl(src, slug, j));
    }
    if (images.length === 0) {
      console.warn(`Bỏ qua "${title}" — không có ảnh.`);
      continue;
    }

    const car = {
      slug,
      title,
      brand: slugify(brandName, { lower: true, strict: true }),
      brandName,
      model,
      year,
      priceTrieu: Math.round((ad.price ?? 0) / 1_000_000),
      odoKm: ad.mileage_v2 ?? ad.mileage ?? null,
      fuel: FUEL[ad.fuel] ?? "Xăng",
      transmission: GEARBOX[ad.gearbox] ?? "Số tự động",
      bodyType,
      seats: guessSeats(bodyType, title),
      location: [ad.ward_name_v3, ad.region_name_v3].filter(Boolean).join(", "),
      description: cleanDescription(ad.body ?? ""),
      highlights: toHighlights(ad.body ?? ""),
      images,
      coverImage: images[0].url,
      isFeatured: i < 4,
      isVerified: Boolean(ad.company_ad),
      status: "dang-ban",
      createdAt: now - i * 60_000,
      updatedAt: now - i * 60_000,
    };

    const ref = await db.collection("cars").add(car);
    console.log(`✓ ${ref.id}  ${title}  (${images.length} ảnh)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
