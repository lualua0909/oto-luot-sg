import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { LeadForm } from "@/components/home/lead-form";
import { SITE } from "@/lib/constants";
import { T } from "@/components/shared/editable-text";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: `Liên hệ ${SITE.fullName} — hotline ${SITE.phoneDisplay}, địa chỉ ${SITE.address}.`,
};

export default function ContactPage() {
  return (
    <div>
      <div className="container-page py-10">
        <SectionHeading
          id="contact.heading"
          eyebrow="Liên hệ"
          title="Liên hệ với chúng tôi"
          description="Ghé showroom, gọi điện hoặc để lại thông tin — chúng tôi luôn sẵn sàng hỗ trợ."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-card">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold"><T id="contact.addressLabel">Địa chỉ showroom</T></p>
              <p className="mt-1 text-sm text-muted-foreground">{SITE.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-card">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold"><T id="contact.hotlineLabel">Hotline / Zalo</T></p>
              <p className="mt-1 text-sm text-muted-foreground">
                {SITE.phoneDisplay}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-card">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold"><T id="contact.hoursLabel">Giờ mở cửa</T></p>
              <p className="mt-1 text-sm text-muted-foreground">
                <T id="contact.hours">7:30 - 19:00, tất cả các ngày trong tuần</T>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border shadow-card">
          <iframe
            src={SITE.mapEmbedUrl}
            className="h-80 w-full"
            loading="lazy"
            title="Bản đồ showroom Ô TÔ LƯỚT SÀI GÒN"
          />
        </div>
      </div>

      <LeadForm />
    </div>
  );
}
