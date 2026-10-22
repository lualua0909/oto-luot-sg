import Link from "next/link";
import { ArrowRight, CarFront, ClipboardCheck, FileCheck2, KeyRound, ShieldCheck } from "lucide-react";

const STEPS = [
  { icon: CarFront, title: "Xem đúng xe thực tế", text: "Đối chiếu hình ảnh, số km, trang bị và tình trạng xe ngay tại showroom." },
  { icon: ClipboardCheck, title: "Kiểm tra trước khi mua", text: "Kiểm tra máy, hộp số, khung gầm, thân vỏ và các hạng mục được công bố theo từng xe." },
  { icon: FileCheck2, title: "Đối chiếu giấy tờ", text: "Xác minh thông tin đăng ký, số khung, số máy và các giấy tờ liên quan trước khi ký." },
  { icon: KeyRound, title: "Hoàn tất giao dịch", text: "Giá, khoản thanh toán và nội dung hỗ trợ được thể hiện trong biên nhận hoặc hợp đồng." },
];

export function TrustProcessSection() {
  return (
    <section className="border-y border-border bg-white py-16">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.5fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Mua xe có căn cứ</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-primary">Quy trình rõ ràng trước khi xuống tiền</h2>
            <p className="mt-4 leading-7 text-muted-foreground">Thông tin trên website là bước tham khảo. Quyết định mua chỉ nên được đưa ra sau khi khách hàng xem xe, kiểm tra và đối chiếu hồ sơ thực tế.</p>
            <Link href="/dich-vu/kiem-tra-xe-o-to-cu" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">Xem quy trình kiểm tra xe <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-2xl border border-border bg-background p-5">
                <span className="absolute right-4 top-3 font-display text-3xl font-extrabold text-primary/10">0{index + 1}</span>
                <step.icon className="h-6 w-6 text-success" />
                <h3 className="mt-4 font-display font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-primary px-6 py-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-3 text-sm leading-6"><ShieldCheck className="h-6 w-6 shrink-0 text-accent" /> Khách hàng có thể đề nghị kiểm tra xe cùng kỹ thuật viên hoặc đơn vị độc lập trước khi mua.</span>
          <Link href="/chinh-sach/ban-hang" className="shrink-0 text-sm font-bold text-accent hover:underline">Xem chính sách bán hàng</Link>
        </div>
      </div>
    </section>
  );
}
