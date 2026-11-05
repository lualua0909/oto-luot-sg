import { adminCreateNews, adminDeleteNews, adminGetAllNews, adminGetNews, adminUpdateNews } from "@/lib/actions";
import { unwrap } from "@/lib/action-result";
import type { NewsInput } from "@/lib/data/news";
import { idToken } from "./session";
export type { NewsInput } from "@/lib/data/news";

export const getAllNewsAdmin = async () => unwrap(adminGetAllNews(await idToken()));
export const getNewsByIdAdmin = async (id: string) => unwrap(adminGetNews(await idToken(), id));
export const createNews = async (input: NewsInput) => unwrap(adminCreateNews(await idToken(), input));
export const updateNews = async (id: string, input: Partial<NewsInput>) => unwrap(adminUpdateNews(await idToken(), id, input));
export const deleteNews = async (id: string) => unwrap(adminDeleteNews(await idToken(), id));
