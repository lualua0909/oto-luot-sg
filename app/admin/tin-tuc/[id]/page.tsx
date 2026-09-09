"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { NewsForm } from "@/components/admin/news-form";
import { getNewsByIdAdmin } from "@/lib/firebase/news";
import { NewsPost } from "@/lib/types";

export default function EditNewsPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getNewsByIdAdmin(params.id);
        if (!p) setNotFound(true);
        else setPost(p);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !post) {
    return <p className="text-center text-muted-foreground">Không tìm thấy bài viết này.</p>;
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold">Sửa bài viết</h1>
        <p className="text-sm text-muted-foreground">{post.title}</p>
      </div>
      <NewsForm post={post} />
    </div>
  );
}
