import "server-only";
import { randomUUID } from "node:crypto";
import slugify from "slugify";
import { d1, parseRows } from "@/lib/server/d1";
import type { Car } from "@/lib/types";
export { applyCarFilters } from "@/lib/car-filters";

/** Cars in D1 (table `cars`, record JSON in `data`). No data cache. */

const toCars = (rows: Record<string, unknown>[]) => parseRows<Car>(rows, (r) => ({ id: String(r.id) }));

function carSlug(title: string, year: number) {
  return `${slugify(title, { lower: true, locale: "vi", strict: true })}-${year}-${Date.now().toString().slice(-4)}`;
}

/** Cars on sale or on deposit, newest first. Used on listing pages. */
export async function getPublishedCars(max = 60): Promise<Car[]> {
  return toCars(await d1("SELECT id, data FROM cars WHERE status IN ('dang-ban','dang-coc') ORDER BY created_at DESC LIMIT ?", [max]));
}

/** Featured cars for the homepage; falls back to the newest cars. */
export async function getFeaturedCars(max = 12): Promise<Car[]> {
  const featured = toCars(await d1("SELECT id, data FROM cars WHERE status IN ('dang-ban','dang-coc') AND is_featured = 1 ORDER BY created_at DESC LIMIT ?", [max]));
  return featured.length ? featured : getPublishedCars(max);
}

export async function getCarsByBrand(brandSlug: string, max = 60): Promise<Car[]> {
  return toCars(await d1("SELECT id, data FROM cars WHERE status IN ('dang-ban','dang-coc') AND brand = ? ORDER BY created_at DESC LIMIT ?", [brandSlug, max]));
}

/**
 * Cars to suggest under a car's detail page. Every other car on sale is scored by
 * how close it is to this one (brand, model, body type, price, year).
 */
export async function getRelatedCars(car: Car, max = 4): Promise<Car[]> {
  const candidates = (await getPublishedCars(60)).filter((c) => c.id !== car.id);
  const score = (c: Car) => {
    let s = 0;
    if (c.brand === car.brand) s += 4;
    if (c.brand === car.brand && c.model && c.model === car.model) s += 3;
    if (c.bodyType === car.bodyType) s += 3;
    // Price within ±20% counts fully, fading to nothing at ±50%.
    const priceGap = Math.abs(c.priceTrieu - car.priceTrieu) / Math.max(car.priceTrieu, 1);
    s += priceGap <= 0.2 ? 3 : priceGap <= 0.5 ? 1.5 : 0;
    if (Math.abs(c.year - car.year) <= 2) s += 1;
    if (c.transmission === car.transmission) s += 0.5;
    return s;
  };
  return candidates
    .map((c) => ({ c, s: score(c) }))
    .sort((a, b) => b.s - a.s || b.c.createdAt - a.c.createdAt)
    .slice(0, max)
    .map(({ c }) => c);
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const [car] = toCars(await d1("SELECT id, data FROM cars WHERE slug = ? AND status != 'an' LIMIT 1", [slug]));
  return car ?? null;
}

export async function getCarById(id: string): Promise<Car | null> {
  const [car] = toCars(await d1("SELECT id, data FROM cars WHERE id = ?", [id]));
  return car ?? null;
}

/** Every car regardless of status, newest first (admin). */
export async function getAllCarsAdmin(): Promise<Car[]> {
  return toCars(await d1("SELECT id, data FROM cars ORDER BY created_at DESC"));
}

export type CarInput = Omit<Car, "id" | "slug" | "createdAt" | "updatedAt">;

const clean = <T extends object>(v: T) => Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined)) as T;

async function write(car: Car) {
  const { id, ...data } = car;
  await d1(
    `INSERT INTO cars (id, slug, status, brand, is_featured, created_at, updated_at, data) VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, status=excluded.status, brand=excluded.brand, is_featured=excluded.is_featured, updated_at=excluded.updated_at, data=excluded.data`,
    [id, car.slug, car.status, car.brand, car.isFeatured ? 1 : 0, car.createdAt, car.updatedAt, JSON.stringify(data)],
  );
}

export async function createCar(input: CarInput): Promise<string> {
  const now = Date.now();
  const car = { ...clean(input), id: randomUUID(), slug: carSlug(input.title, input.year), createdAt: now, updatedAt: now } as Car;
  await write(car);
  return car.id;
}

export async function updateCar(id: string, input: Partial<CarInput>): Promise<void> {
  const car = await getCarById(id);
  if (!car) throw new Error("Không tìm thấy xe.");
  await write({ ...car, ...clean(input), id, updatedAt: Date.now() });
}

export async function deleteCar(id: string): Promise<void> {
  await d1("DELETE FROM cars WHERE id = ?", [id]);
}
