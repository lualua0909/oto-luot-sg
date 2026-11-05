import "server-only";
import { randomUUID } from "node:crypto";
import slugify from "slugify";
import { d1, parseRows } from "@/lib/server/d1";
import type { NewsPost } from "@/lib/types";

/** News posts in D1 (table `news`). No data cache. */

const toPosts = (rows: Record<string, unknown>[]) => parseRows<NewsPost>(rows, (r) => ({ id: String(r.id) }));
const newsSlug = (title: string) => slugify(title, { lower: true, locale: "vi", strict: true });

export async function getPublishedNews(max = 20): Promise<NewsPost[]> {
  return toPosts(await d1("SELECT id, data FROM news WHERE is_published = 1 ORDER BY created_at DESC LIMIT ?", [max]));
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const [post] = toPosts(await d1("SELECT id, data FROM news WHERE slug = ? LIMIT 1", [slug]));
  return post ?? null;
}

export async function getAllNewsAdmin(): Promise<NewsPost[]> {
  return toPosts(await d1("SELECT id, data FROM news ORDER BY created_at DESC"));
}

export async function getNewsByIdAdmin(id: string): Promise<NewsPost | null> {
  const [post] = toPosts(await d1("SELECT id, data FROM news WHERE id = ?", [id]));
  return post ?? null;
}

export type NewsInput = Omit<NewsPost, "id" | "slug" | "createdAt" | "updatedAt">;

async function write(post: NewsPost) {
  const { id, ...data } = post;
  await d1(
    `INSERT INTO news (id, slug, is_published, created_at, updated_at, data) VALUES (?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, is_published=excluded.is_published, updated_at=excluded.updated_at, data=excluded.data`,
    [id, post.slug, post.isPublished ? 1 : 0, post.createdAt, post.updatedAt, JSON.stringify(data)],
  );
}

export async function createNews(input: NewsInput): Promise<string> {
  const now = Date.now();
  const post: NewsPost = { ...input, id: randomUUID(), slug: newsSlug(input.title), createdAt: now, updatedAt: now };
  await write(post);
  return post.id;
}

export async function updateNews(id: string, input: Partial<NewsInput>): Promise<void> {
  const post = await getNewsByIdAdmin(id);
  if (!post) throw new Error("Không tìm thấy bài viết.");
  await write({ ...post, ...input, id, updatedAt: Date.now() });
}

export async function deleteNews(id: string): Promise<void> {
  await d1("DELETE FROM news WHERE id = ?", [id]);
}
