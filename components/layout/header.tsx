"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Phone, Mail, Car, CarFront, Wrench, Newspaper, Building2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NAV_LINKS, SERVICE_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useShowroomSettings } from "@/components/shared/showroom-settings-provider";
import { useBrands } from "@/components/shared/brands-provider";
import { T } from "@/components/shared/editable-text";

/** "/mua-ban-o-to" → "nav.mua-ban-o-to" — slashes are not usable as Firestore map keys. */
function navTextId(href: string) {
  return `nav${href.replace(/\//g, ".")}`;
}

/** Pills mirror the reference nav: one icon per destination. */
const NAV_ICONS: Record<string, typeof Car> = {
  "/": CarFront,
  "/mua-ban-o-to": Car,
  "/dich-vu": Wrench,
  "/tin-tuc": Newspaper,
  "/gioi-thieu": Building2,
  "/lien-he": MessageSquare,
};

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const site = useShowroomSettings();
  const brands = useBrands();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      {/* Brand band — logo on the left, slogan centred, contact on the right. */}
      <div className="bg-accent text-accent-foreground">
        <div className="container-page flex h-14 items-center justify-between gap-4 md:h-16">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/images/logo.png"
              alt={site.name}
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 rounded-full object-cover md:h-10 md:w-10"
            />
            <span className="font-display text-base font-extrabold uppercase leading-none tracking-tight md:text-xl">
              {site.name}
            </span>
          </Link>

          <span className="hidden flex-1 text-center font-display text-sm font-bold uppercase tracking-wide md:block lg:text-base">
            {site.slogan}
          </span>

          <div className="hidden shrink-0 items-center gap-4 text-xs font-semibold md:flex">
            <a href={`tel:${site.phone}`} className="flex items-center gap-1.5 hover:underline">
              <Phone className="h-3.5 w-3.5" /> {site.phoneDisplay}
            </a>
            <span className="hidden items-center gap-1.5 lg:flex">
              <Mail className="h-3.5 w-3.5" /> {site.email}
            </span>
          </div>
        </div>
      </div>

      {/* Pill nav row */}
      <div className="container-page flex h-16 items-center gap-3">
        <Button
          variant="accent"
          className="shrink-0 gap-2 rounded-lg px-4 font-bold uppercase"
          onClick={() => setOpen(true)}
          aria-label="Mở danh mục"
        >
          <Menu className="h-5 w-5" /> <T id="header.menu">Danh mục</T>
        </Button>

        <nav className="hidden flex-1 items-center gap-2 overflow-x-auto lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_LINKS.map((link) => {
            const Icon = NAV_ICONS[link.href] ?? Car;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg border-2 border-primary/85 px-3.5 py-2 text-[15px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <T id={navTextId(link.href)}>{link.label}</T>
                  <Icon className="h-4 w-4" />
                </Link>

                {link.href === "/mua-ban-o-to" && (
                  <div className="invisible absolute left-0 top-full z-10 grid w-[560px] grid-cols-3 gap-1 rounded-xl border border-border bg-popover p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {brands.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/mua-ban-o-to/${b.slug}`}
                        className="rounded-md px-3 py-2 text-[15px] text-foreground/80 hover:bg-muted hover:text-primary"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                )}

                {link.href === "/dich-vu" && (
                  <div className="invisible absolute left-0 top-full z-10 grid w-72 gap-1 rounded-xl border border-border bg-popover p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {SERVICE_LINKS.map((sv) => (
                      <Link
                        key={sv.href}
                        href={sv.href}
                        className="rounded-md px-3 py-2 text-[15px] text-foreground/80 hover:bg-muted hover:text-primary"
                      >
                        <T id={navTextId(sv.href)}>{sv.label}</T>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="accent" size="default" className="hidden sm:inline-flex">
            <a href={`tel:${site.phone}`}>
              <Phone className="h-4 w-4" /> <T id="header.callNow">Gọi ngay</T>
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" className="overflow-y-auto">
              <div className="flex h-16 items-center border-b border-border px-5 font-display text-base font-bold text-primary">
                {site.name}
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((link) => {
                  const Icon = NAV_ICONS[link.href] ?? Car;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-3 text-base font-medium hover:bg-muted"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <T id={navTextId(link.href)}>{link.label}</T>
                    </Link>
                  );
                })}
                <div className="mt-2 border-t border-border pt-3">
                  <p className="px-3 pb-2 text-xs font-semibold uppercase text-muted-foreground">
                    <T id="header.brandsLabel">Các hãng xe</T>
                  </p>
                  <div className="grid grid-cols-2">
                    {brands.slice(0, 8).map((b) => (
                      <Link
                        key={b.slug}
                        href={`/mua-ban-o-to/${b.slug}`}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
              <div className="mt-auto p-4">
                <Button asChild variant="accent" size="lg" className="w-full">
                  <a href={`tel:${site.phone}`}>
                    <Phone className="h-4 w-4" /> <T id="header.callNowMobile">Gọi ngay</T>: {site.phoneDisplay}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
