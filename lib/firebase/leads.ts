import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "./client";
import { Lead } from "../types";

const LEADS = "leads";

export type LeadInput = Omit<Lead, "id" | "createdAt" | "status">;

/** Public: submit the "Đăng ký nhận tư vấn - báo giá" form. No auth required (see firestore.rules). */
export async function submitLead(input: LeadInput): Promise<void> {
  await addDoc(collection(db, LEADS), {
    ...input,
    status: "moi",
    createdAt: Date.now(),
  });
}

/** ADMIN: list all leads, newest first. */
export async function getAllLeadsAdmin(): Promise<Lead[]> {
  const q = query(collection(db, LEADS), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, "id">) }));
}

export async function updateLeadStatus(id: string, status: Lead["status"]): Promise<void> {
  await updateDoc(doc(db, LEADS, id), { status });
}

export async function deleteLead(id: string): Promise<void> {
  await deleteDoc(doc(db, LEADS, id));
}
