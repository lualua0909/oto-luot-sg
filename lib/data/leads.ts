import "server-only";
import { randomUUID } from "node:crypto";
import { d1, parseRows } from "@/lib/server/d1";
import type { Lead } from "@/lib/types";

/** Leads ("Đăng ký nhận tư vấn") in D1 (table `leads`). Only admins can read them. */

export type LeadInput = Omit<Lead, "id" | "createdAt" | "status">;

export async function submitLead(input: LeadInput): Promise<void> {
  const lead = {
    name: String(input.name ?? "").slice(0, 120),
    phone: String(input.phone ?? "").slice(0, 30),
    email: input.email ? String(input.email).slice(0, 160) : undefined,
    topic: String(input.topic ?? "").slice(0, 120),
    message: String(input.message ?? "").slice(0, 4000),
    carId: input.carId ? String(input.carId).slice(0, 80) : undefined,
    carTitle: input.carTitle ? String(input.carTitle).slice(0, 200) : undefined,
    status: "moi" as const,
    createdAt: Date.now(),
  };
  if (!lead.name.trim() || !lead.phone.trim()) throw new Error("Vui lòng nhập họ tên và số điện thoại.");
  await d1("INSERT INTO leads (id, status, created_at, data) VALUES (?,?,?,?)", [randomUUID(), lead.status, lead.createdAt, JSON.stringify(lead)]);
}

export async function getAllLeadsAdmin(): Promise<Lead[]> {
  const rows = await d1("SELECT id, status, data FROM leads ORDER BY created_at DESC");
  return parseRows<Lead>(rows, (r) => ({ id: String(r.id), status: r.status as Lead["status"] }));
}

export async function updateLeadStatus(id: string, status: Lead["status"]): Promise<void> {
  if (!["moi", "da-lien-he", "da-xong"].includes(status)) throw new Error("Trạng thái không hợp lệ.");
  await d1("UPDATE leads SET status = ?, data = json_set(data, '$.status', ?) WHERE id = ?", [status, status, id]);
}

export async function deleteLead(id: string): Promise<void> {
  await d1("DELETE FROM leads WHERE id = ?", [id]);
}
