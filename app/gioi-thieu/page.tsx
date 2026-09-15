import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Handshake, BadgeCheck, Wallet } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { getShowroomSettings } from "@/lib/firebase/settings";
import { T } from "@/components/shared/editable-text";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getShowroomSettings();
  return {
    title: "Giới thiệu",
    description: `Tìm hiểu về ${site.fullName} — showroom ô tô lướt uy tín tại TP.HCM.`,
  };
}

const VALUES = [
  { id: "about.value1", icon: ShieldCheck, title: "Minh bạch", desc: "Giấy tờ, nguồn gốc xe rõ ràng, không mập mờ về giá." },
  { id: "about.value2", icon: BadgeCheck, title: "Chất lượng", desc: "Xe được kiểm tra kỹ thuật trước khi lên sàn." },
  { id: "about.value3", icon: Handshake, title: "Tận tâm", desc: "Tư vấn đúng nhu cầu, không ép khách mua xe." },
  { id: "about.value4", icon: Wallet, title: "Hỗ trợ tài chính", desc: "Liên kết ngân hàng, hỗ trợ trả góp linh hoạt." },
];

export default async function AboutPage() {
  const site = await getShowroomSettings();
  return (
    <div className="container-page py-10">
      <SectionHeading
        id="about.heading"
        eyebrow="Giới thiệu"
        title={site.fullName}
        description={site.slogan}
      />

      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <p className="leading-relaxed text-foreground/85">
            <T id="about.paragraph1a">Mua bán ô tô cũ uy tín không phải là điều dễ dàng. Nắm bắt được nhu cầu đó,</T>{" "}
            {site.fullName}{" "}
            <T id="about.paragraph1b">ra đời với mục tiêu trở thành cầu nối tin cậy giữa người mua và người bán xe.</T>
          </p>
          <p className="mt-4 leading-relaxed text-foreground/85">
            <T id="about.paragraph2">Với định hướng phát triển lâu dài, chúng tôi không ngừng nâng cao chất lượng dịch vụ, mang đến cho khách hàng những trải nghiệm mua bán xe chuyên nghiệp, minh bạch và an toàn — từ khâu tư vấn chọn xe, kiểm tra kỹ thuật, cho đến hoàn tất thủ tục giấy tờ.</T>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <T id="about.addressLabel">Địa chỉ showroom</T>: {site.address}
            <br />
            <T id="about.hotlineLabel">Hotline / Zalo</T>: {site.phoneDisplay}
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
            <p className="mt-3 font-display text-sm font-semibold">
              <T id={`${v.id}.title`}>{v.title}</T>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <T id={`${v.id}.desc`}>{v.desc}</T>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
