import { NewsForm } from "@/components/admin/news-form";

export default function NewNewsPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold">Viết bài mới</h1>
        <p className="text-sm text-muted-foreground">Chia sẻ kiến thức, kinh nghiệm mua bán xe cho khách hàng.</p>
      </div>
      <NewsForm />
    </div>
  );
}
