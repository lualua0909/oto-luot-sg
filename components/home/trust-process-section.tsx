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
          <div data-reveal-stagger>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Mua xe có căn cứ</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-primary">Quy trình rõ ràng trước khi xuống tiền</h2>
            <p className="mt-4 leading-7 text-muted-foreground">Thông tin trên website là bước tham khảo. Quyết định mua chỉ nên được đưa ra sau khi khách hàng xem xe, kiểm tra và đối chiếu hồ sơ thực tế.</p>
            <Link href="/dich-vu/kiem-tra-xe-o-to-cu" className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary"><span className="fx-underline">Xem quy trình kiểm tra xe</span> <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" /></Link>
          </div>
          <ol data-reveal-stagger className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <li key={step.title} data-tilt className="group fx-spotlight relative overflow-hidden rounded-2xl border border-border bg-background p-5 transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-xl">
                <span className="absolute right-4 top-3 font-display text-3xl font-extrabold text-primary/10 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-125 group-hover:text-accent/30">0{index + 1}</span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 transition-all duration-500 group-hover:rotate-[8deg] group-hover:scale-110 group-hover:bg-success group-hover:shadow-lg">
                  <step.icon className="h-6 w-6 text-success transition-colors duration-300 group-hover:text-white" />
                </span>
                <h3 className="mt-4 font-display font-bold transition-colors group-hover:text-primary">{step.title}</h3>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-success to-accent transition-transform duration-500 group-hover:scale-x-100" />
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div data-reveal="up" className="mt-8 flex flex-col gap-3 rounded-2xl bg-primary px-6 py-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-3 text-sm leading-6"><ShieldCheck className="h-6 w-6 shrink-0 animate-pulse text-accent" /> Khách hàng có thể đề nghị kiểm tra xe cùng kỹ thuật viên hoặc đơn vị độc lập trước khi mua.</span>
          <Link href="/chinh-sach/ban-hang" className="shrink-0 text-sm font-bold text-accent hover:underline">Xem chính sách bán hàng</Link>
        </div>
      </div>
    </section>
  );
}
