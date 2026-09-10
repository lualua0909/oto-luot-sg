import { AdminGuard } from "@/components/admin/admin-guard";

export const metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>{children}</AdminGuard>
  );
}
