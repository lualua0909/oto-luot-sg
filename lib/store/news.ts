import { adminCreateNews, adminDeleteNews, adminGetAllNews, adminGetNews, adminUpdateNews } from "@/lib/actions";
import type { NewsInput } from "@/lib/data/news";
import { idToken } from "./session";
export type { NewsInput } from "@/lib/data/news";

export const getAllNewsAdmin = async () => adminGetAllNews(await idToken());
export const getNewsByIdAdmin = async (id: string) => adminGetNews(await idToken(), id);
export const createNews = async (input: NewsInput) => adminCreateNews(await idToken(), input);
export const updateNews = async (id: string, input: Partial<NewsInput>) => adminUpdateNews(await idToken(), id, input);
export const deleteNews = async (id: string) => adminDeleteNews(await idToken(), id);
