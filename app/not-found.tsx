import Link from "next/link";
import { Button } from "@/components/ui/button";
import { T } from "@/components/shared/editable-text";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="mt-3 font-display text-xl font-bold">
        <T id="notFound.title">Không tìm thấy trang</T>
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        <T id="notFound.description">Trang bạn tìm không tồn tại hoặc đã được di chuyển. Hãy quay lại trang chủ để tiếp tục xem xe.</T>
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/">
          <T id="notFound.cta">Về trang chủ</T>
        </Link>
      </Button>
    </div>
  );
}
