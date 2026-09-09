import type { Metadata } from "next";
import { notFound } from "next/navigation";

const POLICIES: Record<string, { title: string; content: string[] }> = {
  "mua-hang-thanh-toan": {
    title: "Chính sách mua hàng & thanh toán",
    content: [
      "Khách hàng có thể thanh toán bằng tiền mặt, chuyển khoản ngân hàng hoặc trả góp qua ngân hàng liên kết.",
      "Sau khi hai bên thống nhất giá, khách hàng đặt cọc giữ xe và hoàn tất thanh toán khi ký hợp đồng mua bán.",
      "Mọi khoản thanh toán đều có biên nhận, hợp đồng rõ ràng, minh bạch.",
    ],
  },
  "bao-hanh": {
    title: "Chính sách bảo hành",
    content: [
      "Xe được kiểm tra kỹ thuật trước khi bàn giao, đảm bảo hoạt động ổn định.",
      "Hỗ trợ tư vấn kỹ thuật miễn phí sau khi mua xe.",
      "Với các lỗi phát sinh do lỗi kỹ thuật đã cam kết ban đầu, showroom hỗ trợ khắc phục theo thỏa thuận trong hợp đồng.",
    ],
  },
  "ban-hang": {
    title: "Chính sách bán hàng",
    content: [
      "Thông tin xe (đời xe, số km, tình trạng) được công khai trung thực trên website và khi tư vấn trực tiếp.",
      "Hỗ trợ khách hàng xem xe, lái thử trước khi quyết định mua.",
      "Hỗ trợ trọn gói thủ tục sang tên, công chứng, đăng ký xe.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = POLICIES[params.slug];
  return p ? { title: p.title } : {};
}

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const policy = POLICIES[params.slug];
  if (!policy) notFound();

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="font-display text-2xl font-bold">{policy.title}</h1>
      <div className="mt-6 space-y-4">
        {policy.content.map((p, i) => (
          <p key={i} className="leading-relaxed text-foreground/85">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
