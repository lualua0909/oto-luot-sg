import { adminCreateCar, adminDeleteCar, adminGetAllCars, adminGetCar, adminUpdateCar } from "@/lib/actions";
import type { CarInput } from "@/lib/data/cars";
import { idToken } from "./session";
export type { CarInput } from "@/lib/data/cars";
export { applyCarFilters } from "@/lib/car-filters";

/** Admin car operations from the browser (server actions, admin token checked on the server). */
export const getAllCarsAdmin = async () => adminGetAllCars(await idToken());
export const getCarById = async (id: string) => adminGetCar(await idToken(), id);
export const createCar = async (input: CarInput) => adminCreateCar(await idToken(), input);
export const updateCar = async (id: string, input: Partial<CarInput>) => adminUpdateCar(await idToken(), id, input);
export const deleteCar = async (id: string) => adminDeleteCar(await idToken(), id);
