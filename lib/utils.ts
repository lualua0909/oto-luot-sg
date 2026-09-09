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

/** Format a plain VND integer amount, e.g. 330000000 -> "330.000.000 đ" */
export function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export function formatDate(date: Date | string | number) {
  const d = typeof date === "object" ? date : new Date(date);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
