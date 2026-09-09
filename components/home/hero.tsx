import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Phone, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

const STATS = [
  { icon: ShieldCheck, label: "Xe rõ nguồn gốc, giấy tờ minh bạch" },
  { icon: BadgeCheck, label: "Kiểm tra kỹ trước khi bàn giao" },
  { icon: Wallet, label: "Hỗ trợ trả góp, thủ tục nhanh gọn" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Depth: a warm accent glow behind the copy and a cool one behind the photos,
          so the flat navy block reads as a lit space instead of a solid rectangle. */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-56 right-0 h-[520px] w-[520px] rounded-full bg-sky-400/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.10),transparent_60%)]" />

      <div className="container-page relative grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div className="animate-fade-up">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-accent backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Showroom ô tô lướt uy tín tại TP.HCM
          </p>
          <h1 className="font-display text-[28px] font-bold leading-[1.15] text-balance sm:text-4xl md:text-5xl">
            Mua bán ô tô cũ,{" "}
            <span className="bg-gradient-to-r from-accent to-amber-300 bg-clip-text text-transparent">
              yên tâm về giá
            </span>{" "}
            và giấy tờ
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-primary-foreground/80 sm:text-base">
            Hơn hàng trăm xe đã qua kiểm tra kỹ thuật, hồ sơ rõ ràng. Đội ngũ tư vấn nhiệt
            tình giúp bạn chọn đúng xe, đúng giá — không cần rành về ô tô vẫn mua được xe ưng ý.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild variant="accent" size="lg" className="shadow-lg shadow-accent/25">
              <a href={`tel:${SITE.phone}`}>
                <Phone className="h-5 w-5" /> Gọi tư vấn: {SITE.phoneDisplay}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15">
              <Link href="/mua-ban-o-to">Xem xe đang bán</Link>
            </Button>
          </div>

          <dl className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
              >
                <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <dt className="text-xs leading-snug text-primary-foreground/85">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Mobile keeps a single wide photo so the hero is not a bare colour block;
            desktop gets the 3-photo collage. */}
        <div className="relative -mx-4 md:hidden">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
            <Image
              src="/images/hero-car-1.jpg"
              alt="Xe ô tô lướt tại Ô TÔ LƯỚT SÀI GÒN"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <Image
                src="/images/hero-car-1.jpg"
                alt="Xe ô tô lướt tại Ô TÔ LƯỚT SÀI GÒN"
                fill
                priority
                sizes="50vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10">
              <Image src="/images/hero-car-2.jpg" alt="Showroom Ô TÔ LƯỚT SÀI GÒN" fill sizes="25vw" className="object-cover" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10">
              <Image src="/images/hero-car-3.jpg" alt="Nhân viên tư vấn kiểm tra xe" fill sizes="25vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
