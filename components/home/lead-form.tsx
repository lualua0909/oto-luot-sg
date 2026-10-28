"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/section-heading";
import { LEAD_TOPICS } from "@/lib/constants";
import { submitLead } from "@/lib/firebase/leads";
import { Headset, Loader2, Phone } from "lucide-react";
import { T } from "@/components/shared/editable-text";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { useShowroomSettings } from "@/components/shared/showroom-settings-provider";

interface LeadFormProps {
  defaultTopic?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  id?: string;
}

export function LeadForm({
  defaultTopic = LEAD_TOPICS[0],
  eyebrow = "Tư vấn miễn phí",
  title = "Đăng ký nhận tư vấn - báo giá",
  description = "Để lại thông tin, đội ngũ Ô TÔ LƯỚT SÀI GÒN sẽ liên hệ tư vấn trong vòng 30 phút.",
  id,
}: LeadFormProps = {}) {
  const initialTopic = LEAD_TOPICS.includes(defaultTopic) ? defaultTopic : LEAD_TOPICS[0];
  const site = useShowroomSettings();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(initialTopic);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !phone) {
      toast.error("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }

    setLoading(true);
    try {
      await submitLead({ name, phone, email, topic, message });
      track("lead_submitted", { topic });
      toast.success("Đã gửi đăng ký! Chúng tôi sẽ gọi lại cho bạn sớm nhất.");
      form.reset();
      setTopic(initialTopic);
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng gọi hotline để được hỗ trợ ngay.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id={id} className="container-page scroll-mt-24 py-14">
      <div data-reveal="up" className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-card lg:grid-cols-2">
        <div className="bg-primary p-8 text-primary-foreground sm:p-10">
          <SectionHeading
            id="home.lead"
            icon={Headset}
            eyebrow={eyebrow}
            title={title}
            description={description}
            className="mb-6 [&_h2]:text-primary-foreground [&_p]:text-primary-foreground/75"
          />
          <a
            href={`tel:${site.phone}`}
            data-magnetic
            className="group fx-shine inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition-shadow hover:shadow-xl hover:shadow-accent/50"
          >
            <Phone className="h-4 w-4 group-hover:animate-[wiggle_.5s_ease-in-out_2]" /> <T id="home.lead.callNow">Hoặc gọi ngay</T> {site.phoneDisplay}
          </a>
        </div>

        <form onSubmit={onSubmit} data-reveal-stagger className="grid grid-cols-1 gap-4 p-8 sm:grid-cols-2 sm:p-10">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name"><T id="home.lead.labelName">Họ và tên</T></Label>
            <Input id="name" name="name" placeholder="Nguyễn Văn A" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone"><T id="home.lead.labelPhone">Số điện thoại</T></Label>
            <Input id="phone" name="phone" type="tel" placeholder="09xxxxxxxx" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email"><T id="home.lead.labelEmail">Email (không bắt buộc)</T></Label>
            <Input id="email" name="email" type="email" placeholder="ban@email.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topic"><T id="home.lead.labelTopic">Chủ đề</T></Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger id="topic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="message"><T id="home.lead.labelMessage">Nội dung</T></Label>
            <Textarea id="message" name="message" placeholder="Bạn cần tư vấn dòng xe nào, tầm giá bao nhiêu..." />
          </div>
          <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground sm:col-span-2">
            <input type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 rounded border-border" />
            <span>Tôi đồng ý để showroom liên hệ về nội dung đã gửi và đã đọc <Link href="/chinh-sach/bao-mat-thong-tin" className="font-semibold text-primary hover:underline">chính sách bảo mật</Link>.</span>
          </label>
          <Button type="submit" size="lg" variant="accent" disabled={loading} className="fx-shine shadow-lg shadow-accent/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 active:translate-y-0 sm:col-span-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <T id="home.lead.submit">Gửi đăng ký</T>
          </Button>
        </form>
      </div>
    </section>
  );
}
