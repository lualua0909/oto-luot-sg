"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Save, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_SHOWROOM_SETTINGS, getShowroomSettings, saveShowroomSettings } from "@/lib/firebase/settings";
import type { ShowroomSettings } from "@/lib/types";

const FIELDS: Array<{
  key: keyof ShowroomSettings;
  label: string;
  type?: "email" | "url" | "tel";
  placeholder?: string;
}> = [
  { key: "name", label: "Tên showroom" },
  { key: "fullName", label: "Tên đầy đủ / pháp lý" },
  { key: "slogan", label: "Slogan" },
  { key: "phone", label: "Số điện thoại (chỉ số)", type: "tel", placeholder: "0777733099" },
  { key: "phoneDisplay", label: "Số điện thoại hiển thị", type: "tel", placeholder: "0777 733 099" },
  { key: "contactPerson", label: "Người liên hệ" },
  { key: "email", label: "Email", type: "email" },
  { key: "address", label: "Địa chỉ showroom" },
  { key: "facebook", label: "Link Facebook", type: "url" },
  { key: "zalo", label: "Link Zalo", type: "url" },
  { key: "tiktok1", label: "Link TikTok 1", type: "url" },
  { key: "tiktok2", label: "Link TikTok 2", type: "url" },
  { key: "mapEmbedUrl", label: "Link nhúng bản đồ Google Maps", type: "url" },
];

export default function ShowroomSettingsPage() {
  const [settings, setSettings] = useState<ShowroomSettings>(DEFAULT_SHOWROOM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getShowroomSettings()
      .then(setSettings)
      .catch(() => toast.error("Không thể tải cài đặt showroom."))
      .finally(() => setLoading(false));
  }, []);

  function updateField(key: keyof ShowroomSettings, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveShowroomSettings(settings);
      toast.success("Đã lưu thông tin showroom. Website sẽ cập nhật ngay.");
    } catch {
      toast.error("Không thể lưu cài đặt. Hãy kiểm tra quyền Firebase.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-52 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Cài đặt showroom</h1>
          <p className="text-sm text-muted-foreground">Thông tin này hiển thị trên website và được lưu trong Firebase.</p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu thay đổi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Thông tin & kênh liên hệ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <label key={field.key} className={field.key === "mapEmbedUrl" ? "sm:col-span-2" : "space-y-1.5"}>
              <span className="text-sm font-medium">{field.label}</span>
              <Input
                type={field.type ?? "text"}
                value={settings[field.key]}
                placeholder={field.placeholder}
                onChange={(event) => updateField(field.key, event.target.value)}
              />
            </label>
          ))}
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Giới thiệu ngắn</span>
            <Textarea value={settings.description} onChange={(event) => updateField("description", event.target.value)} />
          </label>
        </CardContent>
      </Card>
    </form>
  );
}
