import { BodyType, Brand } from "./types";

export const SITE = {
  name: "Ô TÔ LƯỚT SÀI GÒN",
  fullName: "Ô TÔ LƯỚT SÀI GÒN",
  description:
    "Showroom chuyên mua - bán - trao đổi ô tô lướt tại TP.HCM. Xe kiểm tra kỹ, rõ nguồn gốc, giấy tờ minh bạch. Hỗ trợ tư vấn chọn xe đúng nhu cầu, thủ tục nhanh gọn.",
  slogan: "Xe đẹp - Giá rẻ - Uy tín - Chất lượng",
  // Development fallback. Set NEXT_PUBLIC_SITE_URL to the production domain when deploying.
  url: "http://localhost:3000",
  phone: "",
  phoneDisplay: "  ",
  contactPerson: "",
  email: "",
  address: "TP. Hồ Chí Minh",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3388.3844522279946!2d106.5963590743253!3d10.804014989346454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752b0035781ec7%3A0x9fd5e1dfe8dae7c8!2zQ2jhu6Mgw7QgVMO0IELDrG5oIFTDom4!5e1!3m2!1svi!2s!4v1775621528507!5m2!1svi!2s",
  facebook: "",
  zalo: "",
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

export const LEAD_TOPICS = [
  "Tư vấn mua xe",
  "Bán / ký gửi xe",
  "Ô tô trả góp",
  "Kiểm tra xe trước khi mua",
  "Khác",
];
