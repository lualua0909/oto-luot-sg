import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./client";
import { Car, CarFilters } from "../types";
import slugify from "slugify";

const CARS = "cars";

function carSlug(title: string, year: number) {
  return `${slugify(title, { lower: true, locale: "vi", strict: true })}-${year}-${Date.now()
    .toString()
    .slice(-4)}`;
}

/** Get all cars that are published ("dang-ban"), newest first. Used on listing pages. */
export async function getPublishedCars(max = 60): Promise<Car[]> {
  const q = query(
    collection(db, CARS),
    where("status", "==", "dang-ban"),
    orderBy("createdAt", "desc"),
    fsLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Car, "id">) }));
}

/** Get featured cars for the homepage. */
export async function getFeaturedCars(max = 12): Promise<Car[]> {
  const q = query(
    collection(db, CARS),
    where("status", "==", "dang-ban"),
    where("isFeatured", "==", true),
    orderBy("createdAt", "desc"),
    fsLimit(max)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Car, "id">) }));
  if (results.length > 0) return results;
  // Fallback: no cars marked featured yet → just show latest.
  return getPublishedCars(max);
}

export async function getCarsByBrand(brandSlug: string, max = 60): Promise<Car[]> {
  const q = query(
    collection(db, CARS),
    where("status", "==", "dang-ban"),
    where("brand", "==", brandSlug),
    orderBy("createdAt", "desc"),
    fsLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Car, "id">) }));
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const q = query(collection(db, CARS), where("slug", "==", slug), fsLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<Car, "id">) };
}

export async function getCarById(id: string): Promise<Car | null> {
  const ref = doc(db, CARS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Car, "id">) };
}

/** ADMIN: list every car regardless of status, newest first. */
export async function getAllCarsAdmin(): Promise<Car[]> {
  const q = query(collection(db, CARS), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Car, "id">) }));
}

export type CarInput = Omit<Car, "id" | "slug" | "createdAt" | "updatedAt">;

/** ADMIN: create a new car listing. */
export async function createCar(input: CarInput): Promise<string> {
  const slug = carSlug(input.title, input.year);
  const ref = await addDoc(collection(db, CARS), {
    ...input,
    slug,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

/** ADMIN: update an existing car listing. */
export async function updateCar(id: string, input: Partial<CarInput>): Promise<void> {
  const ref = doc(db, CARS, id);
  await updateDoc(ref, { ...input, updatedAt: Date.now() });
}

/** ADMIN: delete a car listing (does not delete its images from Storage — do that separately). */
export async function deleteCar(id: string): Promise<void> {
  await deleteDoc(doc(db, CARS, id));
}

/** Very simple client-side filter helper for the listing page (small catalog, no need for a search index). */
export function applyCarFilters(cars: Car[], filters: CarFilters): Car[] {
  return cars.filter((c) => {
    if (filters.brand && c.brand !== filters.brand) return false;
    if (filters.bodyType && c.bodyType !== filters.bodyType) return false;
    if (filters.transmission && c.transmission !== filters.transmission) return false;
    if (filters.minPrice && c.priceTrieu < filters.minPrice) return false;
    if (filters.maxPrice && c.priceTrieu > filters.maxPrice) return false;
    if (filters.yearFrom && c.year < filters.yearFrom) return false;
    if (filters.q) {
      const hay = `${c.title} ${c.brandName} ${c.model}`.toLowerCase();
      if (!hay.includes(filters.q.toLowerCase())) return false;
    }
    return true;
  });
}
