export type FuelType = "Xăng" | "Dầu (Diesel)" | "Hybrid" | "Điện";
export type Transmission = "Số tự động" | "Số sàn";
export type BodyType =
  | "Sedan"
  | "SUV (5 chỗ)"
  | "SUV (7 chỗ)"
  | "Hatchback"
  | "Bán tải"
  | "MPV"
  | "Van";
export type CarStatus = "dang-ban" | "da-ban" | "an";

export interface CarImage {
  url: string;
  path: string; // storage path, needed to delete later
}

export interface Car {
  id: string;
  slug: string;
  title: string; // e.g. "Vios 2018 số tự động form mới"
  brand: string; // brand slug, e.g. "toyota"
  brandName: string; // display name, e.g. "Toyota"
  model: string; // e.g. "Vios"
  year: number;
  priceTrieu: number; // price in "triệu VNĐ" for simple editing
  odoKm: number | null;
  fuel: FuelType;
  transmission: Transmission;
  bodyType: BodyType;
  color?: string;
  seats?: number;
  location: string;
  description: string; // rich text / markdown-ish
  highlights: string[]; // bullet points, e.g. "Xe zin tuyệt đối", "Bao rút hồ sơ"
  images: CarImage[];
  coverImage: string;
  isFeatured: boolean;
  isVerified: boolean; // "đã kiểm định"
  status: CarStatus;
  createdAt: number; // epoch ms
  updatedAt: number;
}

export interface Brand {
  slug: string;
  name: string;
  logoUrl?: string;
  order: number;
}

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  topic: string; // "Tư vấn mua xe", "Bán/ký gửi xe", "Trả góp"...
  message: string;
  carId?: string; // if sent from a car detail page
  carTitle?: string;
  status: "moi" | "da-lien-he" | "da-xong";
  createdAt: number;
}

export interface ShowroomSettings {
  name: string;
  fullName: string;
  description: string;
  slogan: string;
  phone: string;
  phoneDisplay: string;
  contactPerson: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  facebook: string;
  zalo: string;
  tiktok1: string;
  tiktok2: string;
}

export interface CarFilters {
  brand?: string;
  bodyType?: BodyType;
  minPrice?: number;
  maxPrice?: number;
  transmission?: Transmission;
  yearFrom?: number;
  q?: string;
}

/** 0 = root, 1 = admin, 2 = user (default for newly created accounts). */
export const ROLE = { ROOT: 0, ADMIN: 1, USER: 2 } as const;
export type UserRole = (typeof ROLE)[keyof typeof ROLE];

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: number;
}
