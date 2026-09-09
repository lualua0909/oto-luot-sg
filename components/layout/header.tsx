"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Phone, Mail, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS, SERVICE_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useShowroomSettings } from "@/components/shared/showroom-settings-provider";
import { useBrands } from "@/components/shared/brands-provider";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const site = useShowroomSettings();
  const brands = useBrands();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      {/* Top info bar — desktop only, builds trust before the visitor scrolls */}
      <div className="hidden bg-primary text-primary-foreground md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {site.phoneDisplay} ({site.contactPerson})
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {site.email}
            </span>
          </div>
          <span>{site.address}</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-page flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground md:h-12 md:w-12 md:text-xl">
            CB
          </span>
          <span className="font-display leading-tight">
            <span className="block text-sm font-bold text-primary md:text-base">{site.name}</span>
            <span className="block text-[11px] font-medium text-muted-foreground md:text-xs">
              {site.slogan}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const hasChildren = link.href === "/mua-ban-o-to" || link.href === "/dich-vu";
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground",
                    isActive && "text-primary"
                  )}
                >
                  {link.label}
                  {hasChildren && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>

                {link.href === "/mua-ban-o-to" && (
                  <div className="invisible absolute left-0 top-full grid w-[560px] grid-cols-3 gap-1 rounded-xl border border-border bg-popover p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {brands.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/mua-ban-o-to/${b.slug}`}
                        className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                )}

                {link.href === "/dich-vu" && (
                  <div className="invisible absolute left-0 top-full grid w-72 gap-1 rounded-xl border border-border bg-popover p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {SERVICE_LINKS.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="accent" size="default" className="hidden sm:inline-flex">
            <a href={`tel:${site.phone}`}>
              <Phone className="h-4 w-4" /> Gọi ngay
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Mở menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <div className="flex h-16 items-center border-b border-border px-5 font-display text-base font-bold text-primary">
                {site.name}
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 border-t border-border pt-3">
                  <p className="px-3 pb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Các hãng xe
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
                    <Phone className="h-4 w-4" /> Gọi ngay: {site.phoneDisplay}
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
