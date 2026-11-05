import { adminCreateCar, adminDeleteCar, adminGetAllCars, adminGetCar, adminUpdateCar } from "@/lib/actions";
import { unwrap } from "@/lib/action-result";
import type { CarInput } from "@/lib/data/cars";
import { idToken } from "./session";
export type { CarInput } from "@/lib/data/cars";
export { applyCarFilters } from "@/lib/car-filters";

/** Admin car operations from the browser (server actions, admin token checked on the server). */
export const getAllCarsAdmin = async () => unwrap(adminGetAllCars(await idToken()));
export const getCarById = async (id: string) => unwrap(adminGetCar(await idToken(), id));
export const createCar = async (input: CarInput) => unwrap(adminCreateCar(await idToken(), input));
export const updateCar = async (id: string, input: Partial<CarInput>) => unwrap(adminUpdateCar(await idToken(), id, input));
export const deleteCar = async (id: string) => unwrap(adminDeleteCar(await idToken(), id));
