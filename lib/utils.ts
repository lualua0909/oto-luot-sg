import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a VND price stored as "triệu" (millions) for display, e.g. 330 -> "330 triệu". */
export function formatPriceTrieu(trieu: number) {
  if (!trieu && trieu !== 0) return "Liên hệ";
  return `${trieu.toLocaleString("vi-VN")} triệu`;
}

export function formatDate(date: Date | string | number) {
  const d = typeof date === "object" ? date : new Date(date);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
