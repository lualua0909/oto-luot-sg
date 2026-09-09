"use client";

import { usePathname } from "next/navigation";
import { Phone, MessageCircle, Facebook } from "lucide-react";
import { useShowroomSettings } from "@/components/shared/showroom-settings-provider";

export function StickyContactBar() {
  const site = useShowroomSettings();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-border bg-background shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden">
      <a
        href={`tel:${site.phone}`}
        className="flex flex-col items-center justify-center gap-0.5 bg-accent py-2.5 text-accent-foreground"
      >
        <Phone className="h-5 w-5" />
        <span className="text-[11px] font-semibold">Gọi ngay</span>
      </a>
      <a
        href={site.zalo}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-0.5 bg-primary py-2.5 text-primary-foreground"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-[11px] font-semibold">Zalo</span>
      </a>
      <a
        href={site.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-0.5 bg-[#1877F2] py-2.5 text-white"
      >
        <Facebook className="h-5 w-5" />
        <span className="text-[11px] font-semibold">Messenger</span>
      </a>
    </div>
  );
}
