"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/section-heading";
import { LEAD_TOPICS, SITE } from "@/lib/constants";
import { submitLead } from "@/lib/firebase/leads";
import { Loader2, Phone } from "lucide-react";

export function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(LEAD_TOPICS[0]);

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
      toast.success("Đã gửi đăng ký! Chúng tôi sẽ gọi lại cho bạn sớm nhất.");
      form.reset();
      setTopic(LEAD_TOPICS[0]);
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng gọi hotline để được hỗ trợ ngay.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-page py-14">
      <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-card lg:grid-cols-2">
        <div className="bg-primary p-8 text-primary-foreground sm:p-10">
          <SectionHeading
            eyebrow="Tư vấn miễn phí"
            title="Đăng ký nhận tư vấn - báo giá"
            description="Để lại thông tin, đội ngũ Ô TÔ LƯỚT SÀI GÒN sẽ liên hệ tư vấn trong vòng 30 phút."
            className="mb-6 [&_h2]:text-primary-foreground [&_p]:text-primary-foreground/75"
          />
          <a
            href={`tel:${SITE.phone}`}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
          >
            <Phone className="h-4 w-4" /> Hoặc gọi ngay {SITE.phoneDisplay}
          </a>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 p-8 sm:grid-cols-2 sm:p-10">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Họ và tên</Label>
            <Input id="name" name="name" placeholder="Nguyễn Văn A" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" name="phone" type="tel" placeholder="09xxxxxxxx" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email (không bắt buộc)</Label>
            <Input id="email" name="email" type="email" placeholder="ban@email.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="topic">Chủ đề</Label>
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
            <Label htmlFor="message">Nội dung</Label>
            <Textarea id="message" name="message" placeholder="Bạn cần tư vấn dòng xe nào, tầm giá bao nhiêu..." />
          </div>
          <Button type="submit" size="lg" variant="accent" disabled={loading} className="sm:col-span-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Gửi đăng ký
          </Button>
        </form>
      </div>
    </section>
  );
}
