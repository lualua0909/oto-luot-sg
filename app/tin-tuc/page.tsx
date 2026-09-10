import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedNews } from "@/lib/firebase/news";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDate } from "@/lib/utils";
import { T } from "@/components/shared/editable-text";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Kiến thức mua bán ô tô",
  description: "Kinh nghiệm, thủ tục và mẹo kiểm tra xe ô tô cũ từ Ô TÔ LƯỚT SÀI GÒN.",
};

export default async function NewsListPage() {
  const posts = await getPublishedNews(60).catch(() => []);

  return (
    <div className="container-page py-10">
      <SectionHeading
        id="news.heading"
        eyebrow="Kiến thức"
        title="Chia sẻ kiến thức về xe"
        description="Kinh nghiệm thực tế giúp bạn mua bán xe cũ an tâm hơn."
      />

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          <T id="news.empty">Chưa có bài viết nào. Vào trang quản trị (/admin) để đăng bài đầu tiên.</T>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/tin-tuc/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <span className="text-xs font-medium text-muted-foreground">{formatDate(post.createdAt)}</span>
                <h2 className="line-clamp-2 font-display text-base font-semibold leading-snug">{post.title}</h2>
                <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
