import { AuthProvider } from "@/lib/firebase/auth-context";
import { AdminGuard } from "@/components/admin/admin-guard";

export const metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
