/**
 * Back up cars/ blobs locally, then recompress and overwrite their exact
 * pathnames so Firestore URLs remain valid.
 *
 * Usage:
 *   node scripts/recompress-blob-cars.mjs backup /absolute/backup/directory
 *   node scripts/recompress-blob-cars.mjs prepare /absolute/backup/directory
 *   node scripts/recompress-blob-cars.mjs apply /absolute/backup/directory
 *   node scripts/recompress-blob-cars.mjs verify /absolute/backup/directory
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { list, head, put } from "@vercel/blob";

const TARGET_BYTES = 80 * 1024;
const MAX_DIMENSION = 1920;
const MIN_QUALITY = 45;
const MAX_QUALITY = 84;
const BACKUP_CONCURRENCY = 4;
const PREPARED_DIRECTORY = "prepared-80k";
const PREPARED_MANIFEST = "prepared-80k.json";
const RESULTS_FILE = "results-80k.json";

async function readToken() {
  const env = await fs.readFile(".env.local", "utf8");
  const match = env.match(/^BLOB_READ_WRITE_TOKEN\s*=\s*(.*)$/m);
  if (!match || !match[1].trim()) throw new Error("Missing BLOB_READ_WRITE_TOKEN in .env.local");
  return match[1].trim().replace(/^(["'])(.*)\1$/, "$2");
}

function assertCarsPath(pathname) {
  if (!pathname.startsWith("cars/") || pathname.includes("\\") || pathname.split("/").some((part) => part === ".." || part === ".")) {
    throw new Error(`Unsafe blob pathname: ${pathname}`);
  }
}

function checksum(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function listCars(token) {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: "cars/", limit: 1000, cursor, token });
    blobs.push(...page.blobs.filter((blob) => blob.pathname.startsWith("cars/")));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  for (const blob of blobs) assertCarsPath(blob.pathname);
  const unique = new Set(blobs.map((blob) => blob.pathname));
  if (unique.size !== blobs.length) throw new Error("Duplicate pathname in cars/ listing");
  return blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
}

async function backup(directory, token) {
  const blobs = await listCars(token);
  if (!blobs.length) throw new Error("No cars/ blobs found; refusing to create an empty backup");
  await fs.mkdir(path.join(directory, "original"), { recursive: true });
  const entries = new Array(blobs.length);
  let next = 0;
  let completed = 0;

  async function worker() {
    while (next < blobs.length) {
      const index = next++;
      const blob = blobs[index];
      const url = new URL(blob.url);
      url.searchParams.set("backup", Date.now().toString());
      const response = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
      if (!response.ok) throw new Error(`Download ${blob.pathname}: HTTP ${response.status}`);
      const data = Buffer.from(await response.arrayBuffer());
      if (data.length !== blob.size) {
        throw new Error(`Size mismatch for ${blob.pathname}: list=${blob.size}, download=${data.length}`);
      }
      const target = path.join(directory, "original", blob.pathname);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, data, { flag: "wx" });
      entries[index] = {
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        sha256: checksum(data),
        contentType: response.headers.get("content-type"),
      };
      completed++;
      if (completed % 20 === 0 || completed === blobs.length) {
        console.log(`Backed up ${completed}/${blobs.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: BACKUP_CONCURRENCY }, () => worker()));
  const manifest = { createdAt: new Date().toISOString(), count: entries.length, entries };
  await fs.writeFile(path.join(directory, "manifest.json"), JSON.stringify(manifest, null, 2), { flag: "wx" });
  console.log(JSON.stringify({ backupDirectory: directory, count: entries.length, bytes: entries.reduce((n, e) => n + e.size, 0) }));
}

async function encodeToTarget(input) {
  const { default: sharp } = await import("sharp");
  const metadata = await sharp(input).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Missing image dimensions");
  const originalLongEdge = Math.max(metadata.width, metadata.height);
  if (metadata.format === "webp" && input.length <= TARGET_BYTES && originalLongEdge <= MAX_DIMENSION) {
    return { data: input, width: metadata.width, height: metadata.height, unchanged: true };
  }

  let longEdge = Math.min(MAX_DIMENSION, originalLongEdge);
  for (let attempt = 0; attempt < 12; attempt++) {
    const encode = async (quality) => sharp(input)
      .rotate()
      .resize({ width: longEdge, height: longEdge, fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    let best = await encode(MAX_QUALITY);
    if (best.data.length <= TARGET_BYTES) return { data: best.data, width: best.info.width, height: best.info.height };

    const lowest = await encode(MIN_QUALITY);
    if (lowest.data.length <= TARGET_BYTES) {
      best = lowest;
      let low = MIN_QUALITY;
      let high = MAX_QUALITY;
      for (let i = 0; i < 6; i++) {
        const quality = Math.floor((low + high + 1) / 2);
        if (quality === low) break;
        const candidate = await encode(quality);
        if (candidate.data.length <= TARGET_BYTES) {
          best = candidate;
          low = quality;
        } else {
          high = quality - 1;
        }
      }
      return { data: best.data, width: best.info.width, height: best.info.height };
    }

    if (longEdge <= 1) break;
    const estimatedScale = Math.sqrt(TARGET_BYTES / lowest.data.length) * 0.95;
    const scale = Math.max(0.7, Math.min(0.9, estimatedScale));
    longEdge = Math.max(1, Math.min(longEdge - 1, Math.floor(longEdge * scale)));
  }
  throw new Error("Could not compress image below 80 KiB");
}

async function verifyBackup(directory) {
  const manifest = JSON.parse(await fs.readFile(path.join(directory, "manifest.json"), "utf8"));
  if (!Array.isArray(manifest.entries) || manifest.entries.length !== manifest.count || !manifest.count) {
    throw new Error("Invalid backup manifest");
  }

  // Verify the entire backup before changing any remote blob.
  for (const entry of manifest.entries) {
    assertCarsPath(entry.pathname);
    const data = await fs.readFile(path.join(directory, "original", entry.pathname));
    if (data.length !== entry.size || checksum(data) !== entry.sha256) {
      throw new Error(`Backup verification failed: ${entry.pathname}`);
    }
  }
  console.log(`Verified ${manifest.entries.length} backed up files`);
  return manifest;
}

async function prepare(directory) {
  const manifest = await verifyBackup(directory);
  const results = [];
  for (let index = 0; index < manifest.entries.length; index++) {
    const entry = manifest.entries[index];
    const original = await fs.readFile(path.join(directory, "original", entry.pathname));
    const encoded = await encodeToTarget(original);
    if (encoded.data.length > TARGET_BYTES || Math.max(encoded.width, encoded.height) > MAX_DIMENSION) {
      throw new Error(`Image does not meet the standard: ${entry.pathname}`);
    }
    const target = path.join(directory, PREPARED_DIRECTORY, entry.pathname);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, encoded.data, { flag: "wx" });
    results.push({
      pathname: entry.pathname,
      oldBytes: entry.size,
      newBytes: encoded.data.length,
      sha256: checksum(encoded.data),
      width: encoded.width,
      height: encoded.height,
      unchanged: !!encoded.unchanged,
    });
    if ((index + 1) % 20 === 0 || index + 1 === manifest.entries.length) {
      console.log(`Prepared ${index + 1}/${manifest.entries.length}`);
    }
  }
  await fs.writeFile(path.join(directory, PREPARED_MANIFEST), JSON.stringify(results, null, 2), { flag: "wx" });
  console.log(JSON.stringify({ prepared: results.length, oldBytes: results.reduce((n, r) => n + r.oldBytes, 0), newBytes: results.reduce((n, r) => n + r.newBytes, 0) }));
}

async function apply(directory, token) {
  const manifest = await verifyBackup(directory);
  const prepared = JSON.parse(await fs.readFile(path.join(directory, PREPARED_MANIFEST), "utf8"));
  if (!Array.isArray(prepared) || prepared.length !== manifest.entries.length) {
    throw new Error("Incomplete prepared image set");
  }
  for (let index = 0; index < manifest.entries.length; index++) {
    const result = prepared[index];
    if (result.pathname !== manifest.entries[index].pathname || result.newBytes > TARGET_BYTES || Math.max(result.width, result.height) > MAX_DIMENSION) {
      throw new Error(`Invalid prepared image: ${result.pathname}`);
    }
    const data = await fs.readFile(path.join(directory, PREPARED_DIRECTORY, result.pathname));
    if (data.length !== result.newBytes || checksum(data) !== result.sha256) {
      throw new Error(`Prepared file verification failed: ${result.pathname}`);
    }
  }
  console.log(`Verified ${prepared.length} compressed files`);

  const resultsPath = path.join(directory, RESULTS_FILE);
  let results = [];
  try {
    results = JSON.parse(await fs.readFile(resultsPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (!Array.isArray(results) || results.some((result, index) => result.pathname !== prepared[index]?.pathname || result.sha256 !== prepared[index].sha256)) {
    throw new Error("Invalid previous progress log");
  }

  // A previous 320 KiB pass was interrupted after the user chose this tighter
  // target. Accept only the original or that known intermediate image state.
  const previousPrepared = JSON.parse(await fs.readFile(path.join(directory, "prepared.json"), "utf8"));
  if (previousPrepared.length !== manifest.entries.length) throw new Error("Incomplete previous prepared set");

  const current = await listCars(token);
  const byPath = new Map(current.map((blob) => [blob.pathname, blob]));
  for (let index = 0; index < manifest.entries.length; index++) {
    const entry = manifest.entries[index];
    const blob = byPath.get(entry.pathname);
    const acceptedSizes = index < results.length
      ? [prepared[index].newBytes]
      : [entry.size, previousPrepared[index].newBytes];
    if (!blob || blob.url !== entry.url || !acceptedSizes.includes(blob.size)) {
      throw new Error(`Remote blob changed since backup: ${entry.pathname}`);
    }
  }

  if (results.length) console.log(`Resuming after ${results.length} completed files`);
  for (let index = results.length; index < manifest.entries.length; index++) {
    const entry = manifest.entries[index];
    const ready = prepared[index];
    const data = await fs.readFile(path.join(directory, PREPARED_DIRECTORY, entry.pathname));
    const existing = await head(entry.url, { token });
    if (existing.pathname !== entry.pathname || existing.url !== entry.url || ![entry.size, previousPrepared[index].newBytes].includes(existing.size)) {
      throw new Error(`Remote blob changed before overwrite: ${entry.pathname}`);
    }
    if (!existing.etag) throw new Error(`Missing ETag: ${entry.pathname}`);

    if (!ready.unchanged) {
      const uploaded = await put(entry.pathname, data, {
        access: "public",
        token,
        contentType: "image/webp",
        addRandomSuffix: false,
        allowOverwrite: true,
        ifMatch: existing.etag,
      });
      if (uploaded.pathname !== entry.pathname || uploaded.url !== entry.url) {
        throw new Error(`URL changed after overwrite: ${entry.pathname}`);
      }
    }
    results.push(ready);
    const temporaryResultsPath = `${resultsPath}.tmp`;
    await fs.writeFile(temporaryResultsPath, JSON.stringify(results, null, 2));
    await fs.rename(temporaryResultsPath, resultsPath);
    if ((index + 1) % 10 === 0 || index + 1 === manifest.entries.length) {
      console.log(`Processed ${index + 1}/${manifest.entries.length}`);
    }
  }
  console.log(JSON.stringify({ processed: results.length, oldBytes: results.reduce((n, r) => n + r.oldBytes, 0), newBytes: results.reduce((n, r) => n + r.newBytes, 0) }));
}

async function verify(directory, token) {
  const manifest = await verifyBackup(directory);
  const prepared = JSON.parse(await fs.readFile(path.join(directory, PREPARED_MANIFEST), "utf8"));
  const current = await listCars(token);
  if (current.length !== manifest.entries.length || prepared.length !== manifest.entries.length) {
    throw new Error(`Blob count mismatch: remote=${current.length}, backup=${manifest.entries.length}`);
  }
  const byPath = new Map(current.map((blob) => [blob.pathname, blob]));
  let checked = 0;
  let totalBytes = 0;
  let next = 0;

  async function worker() {
    while (next < manifest.entries.length) {
      const index = next++;
      const entry = manifest.entries[index];
      const expected = prepared[index];
      const blob = byPath.get(entry.pathname);
      if (!blob || expected.pathname !== entry.pathname || blob.url !== entry.url || blob.size !== expected.newBytes) {
        throw new Error(`Remote listing mismatch: ${entry.pathname}`);
      }
      const metadata = await head(entry.url, { token });
      if (metadata.url !== entry.url || metadata.pathname !== entry.pathname || metadata.size !== expected.newBytes || metadata.contentType !== "image/webp") {
        throw new Error(`Remote HEAD mismatch: ${entry.pathname}`);
      }
      checked++;
      totalBytes += blob.size;
      if (checked % 50 === 0 || checked === manifest.entries.length) {
        console.log(`Verified remote ${checked}/${manifest.entries.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: BACKUP_CONCURRENCY }, () => worker()));
  console.log(JSON.stringify({ checked, totalBytes, originalBytes: manifest.entries.reduce((n, e) => n + e.size, 0), allUrlsPreserved: true, allContentTypesWebp: true }));
}

const [mode, directory] = process.argv.slice(2);
if (!["backup", "prepare", "apply", "verify"].includes(mode) || !directory || !path.isAbsolute(directory)) {
  throw new Error("Usage: node scripts/recompress-blob-cars.mjs backup|prepare|apply|verify /absolute/backup/directory");
}
if (mode === "prepare") await prepare(directory);
else {
  const token = await readToken();
  if (mode === "backup") await backup(directory, token);
  else if (mode === "apply") await apply(directory, token);
  else await verify(directory, token);
}
