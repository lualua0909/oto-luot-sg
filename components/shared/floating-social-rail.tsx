"use client";

import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { useShowroomSettings } from "@/components/shared/showroom-settings-provider";

export function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden>
      <path d="M24 6C13.5 6 5 13.4 5 22.5c0 5.2 2.8 9.8 7.2 12.8-.3 1.2-1.1 3.6-2.7 5.4-.4.5 0 1.2.6 1.1 3.4-.6 6.2-2.1 7.9-3.2 1.9.5 3.9.8 6 .8 10.5 0 19-7.4 19-16.5S34.5 6 24 6Z" />
      <text x="24" y="27" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
        Zalo
      </text>
    </svg>
  );
}

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.3 2 2 6.2 2 11.8c0 2.9 1.2 5.5 3.2 7.2.2.2.3.4.3.6l.1 2.1c0 .5.6.9 1.1.7l2.3-1c.2-.1.4-.1.6 0 1 .3 2.1.4 3.4.4 5.7 0 10-4.2 10-9.8S17.7 2 12 2Zm6 7.6-2.9 4.7c-.5.7-1.5.9-2.2.4l-2.3-1.7c-.2-.2-.5-.2-.7 0l-3.1 2.4c-.4.3-.9-.2-.7-.6l2.9-4.7c.5-.7 1.5-.9 2.2-.4l2.3 1.7c.2.2.5.2.7 0l3.1-2.4c.4-.3.9.2.7.6Z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.5 3c.3 2.1 1.5 3.4 3.5 3.6v2.6c-1.3.1-2.5-.3-3.8-1v5.9c0 4.6-4.4 7.2-8.1 5.3-3-1.5-3.7-5.6-1.4-8 1.2-1.3 3-1.8 4.7-1.4v2.7c-.4-.1-.8-.2-1.2-.2-1.3 0-2.4 1.1-2.4 2.4 0 1.3 1.1 2.4 2.4 2.4 1.4 0 2.6-1.1 2.6-2.6V3h3.7Z" />
    </svg>
  );
}

export function FloatingSocialRail() {
  const site = useShowroomSettings();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  // Every button always renders; a link that is not configured yet just sits inert.
  const items = [
    { href: site.zalo, label: "Chat Zalo", Icon: ZaloIcon, color: "#0068FF" },
    { href: site.facebook, label: "Messenger", Icon: MessengerIcon, color: "#0084FF" },
    { href: site.phone ? `tel:${site.phone}` : "", label: "Gọi ngay", Icon: Phone, color: "#0F6FC5", external: false },
    { href: site.tiktok1, label: "Tiktok", Icon: TiktokIcon, color: "#111827" },
    { href: site.tiktok2, label: "Tiktok 2", Icon: TiktokIcon, color: "#111827" },
  ];

  return (
    <div className="fixed right-2 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2.5 md:right-3 md:gap-3">
      {items.map(({ href, label, Icon, color, external = true }) => (
        <a
          key={label}
          href={href || undefined}
          aria-label={label}
          {...(external && href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group relative flex h-10 w-10 items-center justify-center md:h-11 md:w-11 rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-110"
          style={{ backgroundColor: color }}
        >
          {/* Pulsing halo, same idea as the ring around each icon in the reference rail. */}
          <span
            className="pointer-events-none absolute inset-0 animate-ping rounded-full opacity-30"
            style={{ backgroundColor: color, animationDuration: "2.4s" }}
          />
          <Icon className="relative h-[18px] w-[18px] md:h-5 md:w-5" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap md:block rounded-md bg-foreground px-2.5 py-1 text-xs font-semibold text-background opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
            {label}
          </span>
        </a>
      ))}
    </div>
  );
}
