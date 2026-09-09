import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="mt-3 font-display text-xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Trang bạn tìm không tồn tại hoặc đã được di chuyển. Hãy quay lại trang chủ để tiếp tục xem xe.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </div>
  );
}
