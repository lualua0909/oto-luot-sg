"use server";

/**
 * Server actions for client components (the browser never talks to D1 directly).
 * Admin actions take the caller's Firebase ID token and check the D1 role (0/1).
 */
import { requireAdmin, verifyIdToken } from "@/lib/server/auth";
import * as cars from "@/lib/data/cars";
import * as news from "@/lib/data/news";
import * as leads from "@/lib/data/leads";
import * as brands from "@/lib/data/brands";
import * as content from "@/lib/data/content";
import * as settings from "@/lib/data/settings";
import * as users from "@/lib/data/users";
import type { Brand, Lead, ShowroomSettings } from "@/lib/types";
import type { ActionResult } from "@/lib/action-result";

/**
 * Next.js hides the message of an error thrown by a server action in production
 * ("An error occurred in the Server Components render…"). Signed-in actions catch it
 * and return the message instead; `lib/store/*` turns it back into an Error.
 */
async function run<T>(name: string, fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    console.error(`[action ${name}]`, e);
    return { ok: false, error: e instanceof Error ? e.message : "Có lỗi xảy ra, vui lòng thử lại." };
  }
}

// ---- public ----
export async function submitLeadAction(input: leads.LeadInput) {
  await leads.submitLead(input);
}
export async function getBrandsAction() {
  return brands.getBrands();
}
export async function getContentTextsAction() {
  return content.getContentTexts();
}
export async function getShowroomSettingsAction() {
  return settings.getShowroomSettings();
}

// ---- signed in ----
export async function getMyProfileAction(idToken: string) {
  return run("getMyProfileAction", async () => {
    const account = await verifyIdToken(idToken);
    return users.ensureUserProfile(account.uid, account.email);
  });
}

// ---- admin ----
export async function adminGetAllCars(idToken: string) {
  return run("adminGetAllCars", async () => {
    await requireAdmin(idToken);
    return cars.getAllCarsAdmin();
  });
}
export async function adminGetCar(idToken: string, id: string) {
  return run("adminGetCar", async () => {
    await requireAdmin(idToken);
    return cars.getCarById(id);
  });
}
export async function adminCreateCar(idToken: string, input: cars.CarInput) {
  return run("adminCreateCar", async () => {
    await requireAdmin(idToken);
    return cars.createCar(input);
  });
}
export async function adminUpdateCar(idToken: string, id: string, input: Partial<cars.CarInput>) {
  return run("adminUpdateCar", async () => {
    await requireAdmin(idToken);
    await cars.updateCar(id, input);
  });
}
export async function adminDeleteCar(idToken: string, id: string) {
  return run("adminDeleteCar", async () => {
    await requireAdmin(idToken);
    await cars.deleteCar(id);
  });
}

export async function adminGetAllNews(idToken: string) {
  return run("adminGetAllNews", async () => {
    await requireAdmin(idToken);
    return news.getAllNewsAdmin();
  });
}
export async function adminGetNews(idToken: string, id: string) {
  return run("adminGetNews", async () => {
    await requireAdmin(idToken);
    return news.getNewsByIdAdmin(id);
  });
}
export async function adminCreateNews(idToken: string, input: news.NewsInput) {
  return run("adminCreateNews", async () => {
    await requireAdmin(idToken);
    return news.createNews(input);
  });
}
export async function adminUpdateNews(idToken: string, id: string, input: Partial<news.NewsInput>) {
  return run("adminUpdateNews", async () => {
    await requireAdmin(idToken);
    await news.updateNews(id, input);
  });
}
export async function adminDeleteNews(idToken: string, id: string) {
  return run("adminDeleteNews", async () => {
    await requireAdmin(idToken);
    await news.deleteNews(id);
  });
}

export async function adminGetAllLeads(idToken: string) {
  return run("adminGetAllLeads", async () => {
    await requireAdmin(idToken);
    return leads.getAllLeadsAdmin();
  });
}
export async function adminUpdateLeadStatus(idToken: string, id: string, status: Lead["status"]) {
  return run("adminUpdateLeadStatus", async () => {
    await requireAdmin(idToken);
    await leads.updateLeadStatus(id, status);
  });
}
export async function adminDeleteLead(idToken: string, id: string) {
  return run("adminDeleteLead", async () => {
    await requireAdmin(idToken);
    await leads.deleteLead(id);
  });
}

export async function adminSaveBrand(idToken: string, brand: Brand) {
  return run("adminSaveBrand", async () => {
    await requireAdmin(idToken);
    await brands.saveBrand(brand);
  });
}
export async function adminSaveContentText(idToken: string, id: string, value: string) {
  return run("adminSaveContentText", async () => {
    await requireAdmin(idToken);
    await content.saveContentText(id, value);
  });
}
export async function adminSaveShowroomSettings(idToken: string, value: ShowroomSettings) {
  return run("adminSaveShowroomSettings", async () => {
    await requireAdmin(idToken);
    await settings.saveShowroomSettings(value);
  });
}
