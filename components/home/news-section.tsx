import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { NewsPost } from "@/lib/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatDate } from "@/lib/utils";

export function NewsSection({ posts }: { posts: NewsPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-14">
      <div className="container-page">
        <SectionHeading
          id="home.news"
          icon={BookOpen}
          eyebrow="Kiến thức"
          title="Chia sẻ kinh nghiệm mua bán xe"
          description="Kinh nghiệm thực tế giúp bạn mua xe cũ an tâm hơn."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, 4).map((post) => (
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
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(post.createdAt)}
                </span>
                <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug">
                  {post.title}
                </h3>
                <p className="line-clamp-2 text-xs text-muted-foreground">{post.excerpt}</p>
                <span className="mt-auto flex items-center gap-1 pt-2 text-xs font-semibold text-primary">
                  Đọc tiếp <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
