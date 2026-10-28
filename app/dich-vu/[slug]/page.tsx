import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronRight, ClipboardCheck, HandCoins, HelpCircle, Phone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/home/lead-form";
import { LoanCalculator } from "@/components/finance/loan-calculator";
import { getShowroomSettings } from "@/lib/firebase/settings";
import { SERVICE_PAGES, type ServiceSlug } from "@/lib/services";
import { absoluteUrl } from "@/lib/seo";

const ICONS = {
  "kiem-tra-xe-o-to-cu": ClipboardCheck,
  "thu-mua-xe-o-to-cu": HandCoins,
  "tra-gop": Wallet,
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const service = SERVICE_PAGES[params.slug as ServiceSlug];
  if (!service) return {};
  const url = absoluteUrl(`/dich-vu/${params.slug}`);
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: url },
    openGraph: { title: service.title, description: service.description, url },
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const slug = params.slug as ServiceSlug;
  const service = SERVICE_PAGES[slug];
  if (!service) notFound();
  const site = await getShowroomSettings().catch(() => null);
  const Icon = ICONS[slug];
  const url = absoluteUrl(`/dich-vu/${slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name: service.title,
      description: service.description,
      url,
      areaServed: { "@type": "City", name: "Thành phố Hồ Chí Minh" },
      provider: { "@id": `${absoluteUrl("/")}/#showroom` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Dịch vụ", item: absoluteUrl("/dich-vu") },
        { "@type": "ListItem", position: 3, name: service.title, item: url },
      ],
    },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="bg-primary py-12 text-primary-foreground sm:py-16">
        <div className="container-page">
          <nav className="mb-8 flex items-center gap-1 text-xs text-primary-foreground/60">
            <Link href="/" className="hover:text-white">Trang chủ</Link><ChevronRight className="h-3.5 w-3.5" />
            <Link href="/dich-vu" className="hover:text-white">Dịch vụ</Link>
          </nav>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10"><Icon className="h-6 w-6 text-accent" /></span>
              <p className="mt-5 text-sm font-bold uppercase tracking-[.15em] text-accent">{service.eyebrow}</p>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-5xl">{service.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/78">{service.intro}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild variant="accent" size="lg"><a href="#tu-van">Gửi thông tin <ArrowRight className="h-4 w-4" /></a></Button>
              {site?.phone && <Button asChild variant="outline" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"><a href={`tel:${site.phone}`}><Phone className="h-4 w-4" /> Gọi showroom</a></Button>}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.14em] text-accent">Phạm vi hỗ trợ</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-primary">Khách hàng sẽ được hỗ trợ những gì?</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">Nội dung cụ thể được xác nhận theo từng chiếc xe, hồ sơ và nhu cầu thực tế trước khi thực hiện.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {service.benefits.map((benefit) => <li key={benefit} className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-6"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> {benefit}</li>)}
          </ul>
        </div>
      </section>

      {slug === "tra-gop" && <LoanCalculator />}

      <section className="bg-secondary/45 py-14">
        <div className="container-page">
          <p className="text-sm font-bold uppercase tracking-[.14em] text-accent">Từng bước rõ ràng</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-primary">Quy trình thực hiện</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {service.steps.map(([title, text], index) => (
              <li key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <span className="font-display text-2xl font-extrabold text-accent">0{index + 1}</span>
                <h3 className="mt-3 font-display font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3"><HelpCircle className="h-7 w-7 text-primary" /><h2 className="font-display text-2xl font-bold">Câu hỏi thường gặp</h2></div>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card px-6">
            {service.faqs.map(([question, answer]) => <div key={question} className="py-5"><h3 className="font-display font-bold">{question}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p></div>)}
          </div>
        </div>
      </section>

      <LeadForm id="tu-van" defaultTopic={service.topic} eyebrow="Trao đổi nhu cầu" title={`Nhận tư vấn về ${service.title.toLowerCase()}`} description="Để lại thông tin cơ bản. Showroom sẽ liên hệ để xác nhận nhu cầu, phạm vi hỗ trợ và các bước tiếp theo." />
    </div>
  );
}
