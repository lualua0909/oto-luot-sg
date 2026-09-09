"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Facebook } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useShowroomSettings } from "@/components/shared/showroom-settings-provider";

const POLICY_LINKS = [
  { href: "/chinh-sach/mua-hang-thanh-toan", label: "Mua hàng & thanh toán" },
  { href: "/chinh-sach/bao-hanh", label: "Chính sách bảo hành" },
  { href: "/chinh-sach/ban-hang", label: "Chính sách bán hàng" },
];

export function Footer() {
  const site = useShowroomSettings();
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold">{site.name}</p>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
            {site.description}
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={site.zalo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zalo"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold hover:bg-white/20"
            >
              Zalo
            </a>
          </div>
        </div>

        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Điều hướng
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/85">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Chính sách
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/85">
            {POLICY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Liên hệ
          </p>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/85">
            <li className="flex gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-accent" /> {site.address}
            </li>
            <li className="flex gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-accent" /> {site.phoneDisplay} ({site.contactPerson})
            </li>
            <li className="flex gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-accent" /> {site.email}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} {site.fullName}. Đã đăng ký bản quyền.</p>
          <Link href="/admin" className="hover:text-accent">
            Quản trị viên
          </Link>
        </div>
      </div>
    </footer>
  );
}
