import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/data/news";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { SITE } from "@/lib/constants";
import { T } from "@/components/shared/editable-text";
import { absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { getBusinessProfile } from "@/lib/structured-data/business";
import { blogPostingNode, breadcrumbNode, businessRefNode, webPageNode, websiteNode, ids } from "@/lib/structured-data/schema";
import { imageSrc } from "@/lib/images/url";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getNewsBySlug(params.slug).catch(() => null);
  if (!post) return {};
  const url = absoluteUrl(`/tin-tuc/${post.slug}`);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: { type: "article", url, images: post.coverImage ? [post.coverImage] : [] },
    // Unpublished drafts stay reachable for preview but must not be indexed.
    ...(post.isPublished ? {} : { robots: { index: false, follow: false } }),
  };
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const post = await getNewsBySlug(params.slug).catch(() => null);
  if (!post) notFound();
  const path = `/tin-tuc/${post.slug}`;
  const business = await getBusinessProfile();
  // Drafts are reachable by URL but are not published content → no schema.
  const graph = post.isPublished
    ? [
        websiteNode(business),
        businessRefNode(business),
        webPageNode({
          path,
          name: post.title,
          description: post.excerpt,
          image: post.coverImage,
          about: null,
          mainEntity: ids.article(path),
          hasBreadcrumb: true,
          datePublished: post.createdAt,
          dateModified: post.updatedAt,
        }),
        blogPostingNode(post, path, business),
        breadcrumbNode(path, [
          { name: "Trang chủ", path: "/" },
          { name: "Kiến thức", path: "/tin-tuc" },
          { name: post.title, path },
        ]),
      ]
    : [];

  return (
    <article className="container-page max-w-3xl py-10">
      <JsonLd graph={graph} />
      <nav className="mb-5 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary"><T id="breadcrumb.home">Trang chủ</T></Link>
        <span>/</span>
        <Link href="/tin-tuc" className="hover:text-primary"><T id="breadcrumb.news">Kiến thức</T></Link>
      </nav>

      <p className="text-xs font-medium text-muted-foreground">Đăng ngày {formatDate(post.createdAt)} · Cập nhật {formatDate(post.updatedAt)}</p>
      <h1 className="mt-2 font-display text-2xl font-bold leading-snug sm:text-3xl">{post.title}</h1>

      {post.coverImage && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
          <Image src={imageSrc(post.coverImage)} unoptimized alt={post.title} fill sizes="768px" className="object-cover" />
        </div>
      )}

      <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-line leading-relaxed text-foreground/90">
        {post.content}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
        Nội dung được biên soạn bởi đội ngũ {SITE.fullName} từ kinh nghiệm tư vấn và giao dịch xe đã qua sử dụng. Thông tin pháp lý, chi phí và tài chính có thể thay đổi; vui lòng kiểm tra nguồn chính thức tại thời điểm thực hiện.
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
