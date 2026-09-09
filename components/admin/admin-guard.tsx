"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { AdminShell } from "@/components/admin/admin-shell";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLoginPage) router.replace("/admin/login");
    if (user && isLoginPage) router.replace("/admin");
  }, [user, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  if (!user) return null; // redirecting

  return <AdminShell>{children}</AdminShell>;
}
