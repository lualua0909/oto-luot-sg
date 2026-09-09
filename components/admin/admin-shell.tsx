"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Car,
  Newspaper,
  MessageSquare,
  Settings,
  Tags,
  LogOut,
  Menu,
  ExternalLink,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/xe", label: "Quản lý xe", icon: Car },
  { href: "/admin/tin-tuc", label: "Bài viết", icon: Newspaper },
  { href: "/admin/lien-he", label: "Yêu cầu tư vấn", icon: MessageSquare },
  { href: "/admin/cai-dat", label: "Cài đặt showroom", icon: Settings },
  { href: "/admin/thuong-hieu", label: "Hãng xe & logo", icon: Tags },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
          CB
        </span>
        <span className="font-display text-sm font-bold">Quản trị {SITE.name}</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground/75 hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm text-foreground/75 hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" /> Xem website
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </button>
        {user?.email && <p className="mt-2 truncate px-3.5 text-xs text-muted-foreground">{user.email}</p>}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile topbar */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <span className="font-display text-sm font-bold">Quản trị {SITE.name}</span>
        <button onClick={() => setMobileOpen(true)} aria-label="Mở menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-72 flex-col bg-background shadow-xl">
            <div className="flex justify-end p-2">
              <button onClick={() => setMobileOpen(false)} aria-label="Đóng menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
