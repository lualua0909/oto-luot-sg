import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "./client";
import { BRANDS } from "../constants";
import type { Brand } from "../types";

const brandsCollection = collection(db, "brands");

function mergeBrands(saved: Brand[]) {
  const savedBySlug = new Map(saved.map((brand) => [brand.slug, brand]));
  return BRANDS.map((brand) => ({ ...brand, ...savedBySlug.get(brand.slug) })).sort((a, b) => a.order - b.order);
}

export function subscribeToBrands(callback: (brands: Brand[]) => void) {
  return onSnapshot(query(brandsCollection, orderBy("order")), (snapshot) => {
    callback(mergeBrands(snapshot.docs.map((item) => item.data() as Brand)));
  });
}

export async function saveBrand(brand: Brand): Promise<void> {
  await setDoc(doc(db, "brands", brand.slug), brand, { merge: true });
}
