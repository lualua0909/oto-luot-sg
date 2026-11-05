import type { Car, CarFilters } from "./types";

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
