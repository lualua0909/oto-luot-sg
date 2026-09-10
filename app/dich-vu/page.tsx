import type { Metadata } from "next";
import { ClipboardCheck, HandCoins, Wallet, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { SITE } from "@/lib/constants";
import { T } from "@/components/shared/editable-text";

export const metadata: Metadata = {
  title: "Dịch vụ thu xe",
  description:
    "Dịch vụ kiểm tra xe ô tô cũ, thu mua xe ô tô cũ và hỗ trợ trả góp tại Ô TÔ LƯỚT SÀI GÒN.",
};

const SERVICES = [
  {
    id: "services.item1",
    icon: ClipboardCheck,
    title: "Dịch vụ kiểm tra xe ô tô cũ",
    description:
      "Đội ngũ kỹ thuật kiểm tra toàn diện động cơ, khung gầm, nội thất và giấy tờ trước khi bạn quyết định mua, giúp bạn tránh mua nhầm xe lỗi, xe ngập nước hay đâm đụng nặng.",
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
    description:
      "Liên kết với nhiều ngân hàng, hỗ trợ vay trả góp lên đến 70% giá trị xe, thủ tục đơn giản, duyệt hồ sơ nhanh trong 24h.",
    points: [
      "Vay tối đa 70% giá trị xe",
      "Lãi suất ưu đãi, kỳ hạn linh hoạt",
      "Hỗ trợ hoàn thiện hồ sơ vay",
      "Duyệt hồ sơ nhanh trong 24 giờ",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="container-page py-10">
      <SectionHeading
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
              <a href={`tel:${SITE.phone}`}>
                <Phone className="h-4 w-4" /> <T id="services.cta">Liên hệ tư vấn</T>
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
