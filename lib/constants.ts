import { BodyType, Brand } from "./types";

export const SITE = {
  name: "Ô TÔ LƯỚT SÀI GÒN",
  fullName: "Ô TÔ LƯỚT SÀI GÒN",
  description:
    "Chuyên trang xe cũ đảm bảo chất lượng, uy tín hàng đầu TP.HCM. Xe đẹp - giá tốt, pháp lý chuẩn chỉnh, hỗ trợ thủ tục sang tên, đổi xe tận tình, định giá chuẩn thị trường và giao xe nhanh gọn.",
  slogan: "Xe đẹp - Giá rẻ - Uy tín - Chất lượng",
  // Override with NEXT_PUBLIC_SITE_URL (e.g. http://localhost:3000 in development).
  url: "https://otoluotsaigon.com",
  phone: "0922549999",
  phone2: "0969550995",
  phoneDisplay: "0922 54 9999 - 096 9550995",
  contactPerson: "",
  email: "",
  address: "1060 Nguyễn Ảnh Thủ, P. Trung Mỹ Tây, TP. Hồ Chí Minh",
  mapEmbedUrl:
    "https://www.google.com/maps?q=1060+Nguy%E1%BB%85n+%E1%BA%A2nh+Th%E1%BB%A7,+Trung+M%E1%BB%B9+T%C3%A2y,+TP.HCM&output=embed",
  facebook: "",
  zalo: "https://zalo.me/0922549999",
  tiktok1: "",
  tiktok2: "",
};

export const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/mua-ban-o-to", label: "Mua bán ô tô" },
  { href: "/dich-vu", label: "Dịch vụ thu xe" },
  { href: "/tin-tuc", label: "Kiến thức" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/lien-he", label: "Liên hệ" },
];

export const SERVICE_LINKS = [
  { href: "/dich-vu/kiem-tra-xe-o-to-cu", label: "Dịch vụ kiểm tra xe ô tô cũ" },
  { href: "/dich-vu/thu-mua-xe-o-to-cu", label: "Thu mua xe ô tô cũ" },
  { href: "/dich-vu/tra-gop", label: "Ô tô cũ trả góp" },
];

// Seed list of brands — editable later from /admin/thuong-hieu if you extend the CMS.
export const BRANDS: Brand[] = [
  { slug: "toyota", name: "Toyota", order: 1 },
  { slug: "honda", name: "Honda", order: 2 },
  { slug: "hyundai", name: "Hyundai", order: 3 },
  { slug: "kia", name: "Kia", order: 4 },
  { slug: "mazda", name: "Mazda", order: 5 },
  { slug: "ford", name: "Ford", order: 6 },
  { slug: "mitsubishi", name: "Mitsubishi", order: 7 },
  { slug: "suzuki", name: "Suzuki", order: 8 },
  { slug: "chevrolet", name: "Chevrolet", order: 9 },
  { slug: "nissan", name: "Nissan", order: 10 },
  { slug: "vinfast", name: "VinFast", order: 11 },
  { slug: "mercedes", name: "Mercedes-Benz", order: 12 },
  { slug: "bmw", name: "BMW", order: 13 },
  { slug: "audi", name: "Audi", order: 14 },
  { slug: "lexus", name: "Lexus", order: 15 },
  { slug: "land-rover", name: "Land Rover", order: 16 },
  { slug: "porsche", name: "Porsche", order: 17 },
  { slug: "peugeot", name: "Peugeot", order: 18 },
];

export const BODY_TYPES: BodyType[] = [
  "Sedan",
  "Hatchback",
  "SUV (5 chỗ)",
  "SUV (7 chỗ)",
  "MPV",
  "Bán tải",
  "Van",
];

export const CAR_COLORS = [
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Đỏ", hex: "#E63323" },
  { name: "Cam", hex: "#F4A93B" },
  { name: "Vàng", hex: "#FCE94F" },
  { name: "Xanh lá", hex: "#5DAF5A" },
  { name: "Xanh dương", hex: "#1433F5" },
  { name: "Tím", hex: "#DE32F0" },
  { name: "Hồng", hex: "#E8336E" },
  { name: "Xám", hex: "#555555" },
  { name: "Nâu", hex: "#5A3310" },
  { name: "Bạc", hex: "#D6D6D6" },
  { name: "Đen", hex: "#000000" },
];

export function getCarColorHex(name?: string) {
  const key = name?.trim().toLowerCase();
  return CAR_COLORS.find((c) => c.name.toLowerCase() === key)?.hex;
}

export const LEAD_TOPICS = [
  "Tư vấn mua xe",
  "Bán / ký gửi xe",
  "Ô tô trả góp",
  "Kiểm tra xe trước khi mua",
  "Khác",
];
