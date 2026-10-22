import type { Metadata } from "next";
import { ClipboardCheck, HandCoins, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { T } from "@/components/shared/editable-text";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dịch vụ thu xe",
  description:
    "Dịch vụ kiểm tra xe ô tô cũ, thu mua xe ô tô cũ và hỗ trợ trả góp tại Ô TÔ LƯỚT SÀI GÒN.",
  alternates: { canonical: absoluteUrl("/dich-vu") },
  openGraph: { url: absoluteUrl("/dich-vu") },
};

const SERVICES = [
  {
    id: "services.item1",
    icon: ClipboardCheck,
    title: "Dịch vụ kiểm tra xe ô tô cũ",
    href: "/dich-vu/kiem-tra-xe-o-to-cu",
    description:
      "Hỗ trợ xem xét động cơ, khung gầm, nội thất và giấy tờ theo phạm vi được xác nhận trước khi thực hiện, giúp người mua có thêm thông tin trước khi quyết định.",
    points: [
      "Kiểm tra động cơ, hộp số, khung gầm",
      "Kiểm tra sơn, đâm đụng, ngập nước",
      "Đối chiếu số khung, số máy với giấy tờ",
      "Báo cáo tình trạng xe rõ ràng, trung thực",
    ],
  },
  {
    id: "services.item2",
    icon: HandCoins,
    title: "Thu mua xe ô tô cũ",
    href: "/dich-vu/thu-mua-xe-o-to-cu",
    description:
      "Bạn cần bán xe nhanh? Chúng tôi thu mua trực tiếp với giá hợp lý theo thị trường, thanh toán nhanh gọn, hỗ trợ thủ tục sang tên trọn gói.",
    points: [
      "Định giá xe miễn phí tại nhà hoặc showroom",
      "Thanh toán nhanh trong ngày",
      "Hỗ trợ giấy tờ, công chứng, sang tên",
      "Nhận mọi dòng xe, mọi tình trạng",
    ],
  },
  {
    id: "services.item3",
    icon: Wallet,
    title: "Ô tô cũ trả góp",
    href: "/dich-vu/tra-gop",
    description:
      "Hỗ trợ chuẩn bị thông tin xe và tư vấn hồ sơ mua xe trả góp. Hạn mức, lãi suất và thời gian phê duyệt phụ thuộc ngân hàng và từng hồ sơ.",
    points: [
      "Ước tính khoản trả trước và tiền hàng tháng",
      "Tham khảo lãi suất và kỳ hạn phù hợp",
      "Hỗ trợ hoàn thiện hồ sơ vay",
      "Xem điều kiện chính thức trước khi ký",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="container-page py-10">
      <SectionHeading
        as="h1"
        id="services.heading"
        eyebrow="Dịch vụ"
        title="Dịch vụ thu xe & hỗ trợ khách hàng"
        description="Đồng hành cùng bạn từ lúc chọn xe, kiểm tra xe cho đến khi hoàn tất thủ tục mua bán."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.title} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <s.icon className="h-6 w-6" />
            </span>
            <h2 className="font-display text-lg font-semibold">
              <T id={`${s.id}.title`}>{s.title}</T>
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              <T id={`${s.id}.description`}>{s.description}</T>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {s.points.map((p, i) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{" "}
                  <T id={`${s.id}.point${i + 1}`}>{p}</T>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-6">
              <Link href={s.href}>
                <T id="services.cta">Xem chi tiết</T>
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
