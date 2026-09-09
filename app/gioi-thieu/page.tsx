import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Handshake, BadgeCheck, Wallet } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: `Tìm hiểu về ${SITE.fullName} — showroom ô tô lướt uy tín tại TP.HCM.`,
};

const VALUES = [
  { icon: ShieldCheck, title: "Minh bạch", desc: "Giấy tờ, nguồn gốc xe rõ ràng, không mập mờ về giá." },
  { icon: BadgeCheck, title: "Chất lượng", desc: "Xe được kiểm tra kỹ thuật trước khi lên sàn." },
  { icon: Handshake, title: "Tận tâm", desc: "Tư vấn đúng nhu cầu, không ép khách mua xe." },
  { icon: Wallet, title: "Hỗ trợ tài chính", desc: "Liên kết ngân hàng, hỗ trợ trả góp linh hoạt." },
];

export default function AboutPage() {
  return (
    <div className="container-page py-10">
      <SectionHeading
        eyebrow="Giới thiệu"
        title={SITE.fullName}
        description={SITE.slogan}
      />

      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <p className="leading-relaxed text-foreground/85">
            Mua bán ô tô cũ uy tín không phải là điều dễ dàng. Nắm bắt được nhu cầu đó,{" "}
            {SITE.fullName} ra đời với mục tiêu trở thành cầu nối tin cậy giữa người mua và
            người bán xe.
          </p>
          <p className="mt-4 leading-relaxed text-foreground/85">
            Với định hướng phát triển lâu dài, chúng tôi không ngừng nâng cao chất lượng dịch vụ,
            mang đến cho khách hàng những trải nghiệm mua bán xe chuyên nghiệp, minh bạch và an
            toàn — từ khâu tư vấn chọn xe, kiểm tra kỹ thuật, cho đến hoàn tất thủ tục giấy tờ.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Địa chỉ showroom: {SITE.address}
            <br />
            Hotline / Zalo: {SITE.phoneDisplay} ({SITE.contactPerson})
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
          <Image src="/images/about-team.jpg" alt="Đội ngũ Ô TÔ LƯỚT SÀI GÒN" fill sizes="50vw" className="object-cover" />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-xl border border-border bg-card p-5 text-center shadow-card">
            <v.icon className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-3 font-display text-sm font-semibold">{v.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
