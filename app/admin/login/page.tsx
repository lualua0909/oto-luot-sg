"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE } from "@/lib/constants";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error("Sai email hoặc mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
            CB
          </span>
          <h1 className="mt-3 font-display text-lg font-bold">Đăng nhập quản trị</h1>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.name}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="admin@chootobinhtan.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Đăng nhập
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Tài khoản quản trị được tạo trong Firebase Console → Authentication.
        </p>
      </div>
    </div>
  );
}
