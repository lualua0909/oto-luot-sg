"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Phone, MessageCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitLead } from "@/lib/firebase/leads";
import { useShowroomSettings } from "@/components/shared/showroom-settings-provider";
import { formatPriceTrieu } from "@/lib/utils";
import { Car } from "@/lib/types";

export function CarContactCard({ car }: { car: Car }) {
  const [loading, setLoading] = useState(false);
  const site = useShowroomSettings();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    if (!name || !phone) {
      toast.error("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }
    setLoading(true);
    try {
      await submitLead({
        name,
        phone,
        topic: "Tư vấn mua xe",
        message: `Quan tâm xe: ${car.title}`,
        carId: car.id,
        carTitle: car.title,
      });
      toast.success("Đã gửi! Chúng tôi sẽ gọi lại cho bạn ngay.");
      form.reset();
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng gọi hotline để được hỗ trợ ngay.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden border-border shadow-card lg:sticky lg:top-24">
      <CardHeader className="border-b border-border">
        <p className="text-xs text-muted-foreground">Giá bán</p>
        <CardTitle className="text-2xl text-accent">{formatPriceTrieu(car.priceTrieu)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="grid grid-cols-2 gap-2.5">
          <Button asChild variant="accent" size="lg">
            <a href={`tel:${site.phone}`}>
              <Phone className="h-4 w-4" /> Gọi ngay
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={site.zalo} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Chat Zalo
            </a>
          </Button>
        </div>

        <div className="flex gap-2 rounded-lg bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
          Thông tin xe được showroom kiểm tra trước khi đăng bán.
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-semibold">Hoặc để lại số điện thoại, chúng tôi gọi lại</p>
          <form onSubmit={onSubmit} className="space-y-2.5">
            <Input name="name" placeholder="Họ và tên" required />
            <Input name="phone" type="tel" placeholder="Số điện thoại" required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Gửi yêu cầu tư vấn
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
