import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { T } from "@/components/shared/editable-text";
import { absoluteUrl } from "@/lib/seo";

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
  "bao-mat-thong-tin": {
    title: "Chính sách bảo mật thông tin",
    content: [
      "Website chỉ thu thập thông tin khách hàng chủ động gửi qua biểu mẫu, như họ tên, số điện thoại, email và nội dung cần tư vấn.",
      "Thông tin được sử dụng để liên hệ, tư vấn về xe hoặc dịch vụ mà khách hàng quan tâm và quản lý yêu cầu hỗ trợ.",
      "Khách hàng có thể yêu cầu cập nhật hoặc xóa thông tin đã gửi bằng cách liên hệ trực tiếp với showroom qua hotline công bố trên website.",
      "Không cung cấp thông tin liên hệ của khách hàng cho bên khác ngoài phạm vi cần thiết để thực hiện dịch vụ đã được khách hàng đồng ý hoặc theo yêu cầu hợp pháp của cơ quan có thẩm quyền.",
    ],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = POLICIES[params.slug];
  const url = absoluteUrl(`/chinh-sach/${params.slug}`);
  return p ? { title: p.title, alternates: { canonical: url }, openGraph: { url } } : {};
}

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const policy = POLICIES[params.slug];
  if (!policy) notFound();

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="font-display text-2xl font-bold">
        <T id={`policy.${params.slug}.title`}>{policy.title}</T>
      </h1>
      <div className="mt-6 space-y-4">
        {policy.content.map((p, i) => (
          <p key={i} className="leading-relaxed text-foreground/85">
            <T id={`policy.${params.slug}.paragraph${i + 1}`}>{p}</T>
          </p>
        ))}
      </div>
    </div>
  );
}
