"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Save, Tags } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrands } from "@/components/shared/brands-provider";
import { saveBrand } from "@/lib/firebase/brands";
import { uploadImage } from "@/lib/blob/storage";
import type { Brand } from "@/lib/types";

export default function AdminBrandsPage() {
  const brands = useBrands();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [draft, setDraft] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openEditor(brand: Brand) {
    setEditing(brand);
    setDraft({ ...brand });
  }

  function updateDraft(key: keyof Brand, value: string | number) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const image = await uploadImage(file, "brands");
      updateDraft("logoUrl", image.url);
      toast.success("Đã tải logo lên. Nhấn Lưu thay đổi để áp dụng.");
    } catch (error) {
      const code = (error as { code?: string }).code;
      toast.error(code === "storage/unauthorized" ? "Storage chưa cho phép tải logo. Hãy publish Storage Rules." : "Không thể tải logo lên.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!draft) return;
    if (!draft.name.trim()) {
      toast.error("Tên hãng xe không được để trống.");
      return;
    }
    setSaving(true);
    try {
      await saveBrand({ ...draft, name: draft.name.trim(), order: Number(draft.order) || 1 });
      toast.success("Đã cập nhật hãng xe.");
      setEditing(null);
      setDraft(null);
    } catch {
      toast.error("Không thể lưu. Hãy kiểm tra và publish Firestore Rules.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Hãng xe & logo</h1>
        <p className="text-sm text-muted-foreground">Đổi tên, logo và thứ tự hiển thị các hãng xe trên website.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {brands.map((brand) => (
          <Card key={brand.slug} className="group overflow-hidden">
            <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 p-4 text-center">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt="" className="h-16 w-16 rounded-full object-contain" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary font-display text-lg font-bold text-primary">
                  {brand.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div>
                <p className="font-medium leading-tight">{brand.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">Thứ tự: {brand.order}</p>
              </div>
              <Button type="button" size="sm" variant="outline" className="w-full" onClick={() => openEditor(brand)}>
                <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Tags className="h-5 w-5 text-primary" /> Chỉnh sửa hãng xe</DialogTitle>
            <DialogDescription>Slug không thay đổi để các xe và đường dẫn hiện có vẫn hoạt động.</DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                {draft.logoUrl ? (
                  <img src={draft.logoUrl} alt="Xem trước logo" className="h-16 w-16 rounded-full bg-background object-contain" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary font-display text-lg font-bold text-primary">{draft.name.slice(0, 2).toUpperCase()}</span>
                )}
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleLogoUpload(event.target.files?.[0])} />
                  <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Tải logo
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG hoặc WebP.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand-name">Tên hãng xe</Label>
                <Input id="brand-name" value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand-logo">URL logo</Label>
                <Input id="brand-logo" type="url" placeholder="https://..." value={draft.logoUrl ?? ""} onChange={(event) => updateDraft("logoUrl", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand-order">Thứ tự hiển thị</Label>
                <Input id="brand-order" type="number" min="1" value={draft.order} onChange={(event) => updateDraft("order", Number(event.target.value))} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" onClick={handleSave} disabled={saving || uploading}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
