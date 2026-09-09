import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./client";
import { NewsPost } from "../types";
import slugify from "slugify";

const NEWS = "news";

function newsSlug(title: string) {
  return slugify(title, { lower: true, locale: "vi", strict: true });
}

export async function getPublishedNews(max = 20): Promise<NewsPost[]> {
  const q = query(
    collection(db, NEWS),
    where("isPublished", "==", true),
    orderBy("createdAt", "desc"),
    fsLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsPost, "id">) }));
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const q = query(collection(db, NEWS), where("slug", "==", slug), fsLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<NewsPost, "id">) };
}

export async function getAllNewsAdmin(): Promise<NewsPost[]> {
  const q = query(collection(db, NEWS), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsPost, "id">) }));
}

export async function getNewsByIdAdmin(id: string): Promise<NewsPost | null> {
  const snap = await getDoc(doc(db, NEWS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<NewsPost, "id">) };
}

export type NewsInput = Omit<NewsPost, "id" | "slug" | "createdAt" | "updatedAt">;

export async function createNews(input: NewsInput): Promise<string> {
  const ref = await addDoc(collection(db, NEWS), {
    ...input,
    slug: newsSlug(input.title),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateNews(id: string, input: Partial<NewsInput>): Promise<void> {
  await updateDoc(doc(db, NEWS, id), { ...input, updatedAt: Date.now() });
}

export async function deleteNews(id: string): Promise<void> {
  await deleteDoc(doc(db, NEWS, id));
}
