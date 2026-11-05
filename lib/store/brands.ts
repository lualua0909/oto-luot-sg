import { adminSaveBrand, getBrandsAction } from "@/lib/actions";
import { BRANDS } from "@/lib/constants";
import type { Brand } from "@/lib/types";
import { idToken, liveValue } from "./session";

const live = liveValue(getBrandsAction);

export function subscribeToBrands(callback: (brands: Brand[]) => void) {
  // D1 unreachable: keep the built-in brand list.
  return live.subscribe(callback, () => callback(BRANDS));
}

export async function saveBrand(brand: Brand): Promise<void> {
  await adminSaveBrand(await idToken(), brand);
  await live.notify();
}
