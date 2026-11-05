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
  const account = await verifyIdToken(idToken);
  return users.ensureUserProfile(account.uid, account.email);
}

// ---- admin ----
export async function adminGetAllCars(idToken: string) {
  await requireAdmin(idToken);
  return cars.getAllCarsAdmin();
}
export async function adminGetCar(idToken: string, id: string) {
  await requireAdmin(idToken);
  return cars.getCarById(id);
}
export async function adminCreateCar(idToken: string, input: cars.CarInput) {
  await requireAdmin(idToken);
  return cars.createCar(input);
}
export async function adminUpdateCar(idToken: string, id: string, input: Partial<cars.CarInput>) {
  await requireAdmin(idToken);
  await cars.updateCar(id, input);
}
export async function adminDeleteCar(idToken: string, id: string) {
  await requireAdmin(idToken);
  await cars.deleteCar(id);
}

export async function adminGetAllNews(idToken: string) {
  await requireAdmin(idToken);
  return news.getAllNewsAdmin();
}
export async function adminGetNews(idToken: string, id: string) {
  await requireAdmin(idToken);
  return news.getNewsByIdAdmin(id);
}
export async function adminCreateNews(idToken: string, input: news.NewsInput) {
  await requireAdmin(idToken);
  return news.createNews(input);
}
export async function adminUpdateNews(idToken: string, id: string, input: Partial<news.NewsInput>) {
  await requireAdmin(idToken);
  await news.updateNews(id, input);
}
export async function adminDeleteNews(idToken: string, id: string) {
  await requireAdmin(idToken);
  await news.deleteNews(id);
}

export async function adminGetAllLeads(idToken: string) {
  await requireAdmin(idToken);
  return leads.getAllLeadsAdmin();
}
export async function adminUpdateLeadStatus(idToken: string, id: string, status: Lead["status"]) {
  await requireAdmin(idToken);
  await leads.updateLeadStatus(id, status);
}
export async function adminDeleteLead(idToken: string, id: string) {
  await requireAdmin(idToken);
  await leads.deleteLead(id);
}

export async function adminSaveBrand(idToken: string, brand: Brand) {
  await requireAdmin(idToken);
  await brands.saveBrand(brand);
}
export async function adminSaveContentText(idToken: string, id: string, value: string) {
  await requireAdmin(idToken);
  await content.saveContentText(id, value);
}
export async function adminSaveShowroomSettings(idToken: string, value: ShowroomSettings) {
  await requireAdmin(idToken);
  await settings.saveShowroomSettings(value);
}
