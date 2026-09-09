"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BRANDS } from "@/lib/constants";
import { subscribeToBrands } from "@/lib/firebase/brands";
import type { Brand } from "@/lib/types";

const BrandsContext = createContext<Brand[]>(BRANDS);

export function BrandsProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>(BRANDS);

  useEffect(() => subscribeToBrands(setBrands), []);

  return <BrandsContext.Provider value={brands}>{children}</BrandsContext.Provider>;
}

export function useBrands() {
  return useContext(BrandsContext);
}
