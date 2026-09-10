import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/firebase/news";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { SITE } from "@/lib/constants";
import { T } from "@/components/shared/editable-text";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getNewsBySlug(params.slug).catch(() => null);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: post.coverImage ? [post.coverImage] : [] },
  };
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const post = await getNewsBySlug(params.slug).catch(() => null);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-10">
      <nav className="mb-5 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary"><T id="breadcrumb.home">Trang chủ</T></Link>
        <span>/</span>
        <Link href="/tin-tuc" className="hover:text-primary"><T id="breadcrumb.news">Kiến thức</T></Link>
      </nav>

      <p className="text-xs font-medium text-muted-foreground">{formatDate(post.createdAt)}</p>
      <h1 className="mt-2 font-display text-2xl font-bold leading-snug sm:text-3xl">{post.title}</h1>

      {post.coverImage && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
          <Image src={post.coverImage} alt={post.title} fill sizes="768px" className="object-cover" />
        </div>
      )}

      <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-line leading-relaxed text-foreground/90">
        {post.content}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-secondary/50 p-6 text-center">
        <p className="font-display text-lg font-semibold">
          <T id="news.detail.ctaTitle">Cần tư vấn thêm về xe ô tô cũ?</T>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          <T id="news.detail.ctaSubtitle">Gọi ngay hotline để được hỗ trợ miễn phí.</T>
        </p>
        <Button asChild variant="accent" size="lg" className="mt-4">
          <a href={`tel:${SITE.phone}`}>
            <Phone className="h-4 w-4" /> {SITE.phoneDisplay}
          </a>
        </Button>
      </div>
    </article>
  );
}
