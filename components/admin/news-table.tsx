"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewsPost } from "@/lib/types";
import { getAllNewsAdmin, deleteNews } from "@/lib/firebase/news";
import { formatDate } from "@/lib/utils";

export function NewsTable() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<NewsPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setPosts(await getAllNewsAdmin());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteNews(toDelete.id);
      toast.success("Đã xóa bài viết.");
      setPosts((p) => p.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
    } catch {
      toast.error("Xóa thất bại.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Bài viết</h1>
          <p className="text-sm text-muted-foreground">{posts.length} bài viết</p>
        </div>
        <Button asChild>
          <Link href="/admin/tin-tuc/moi">
            <Plus className="h-4 w-4" /> Viết bài mới
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Chưa có bài viết nào.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bài viết</TableHead>
              <TableHead>Ngày đăng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {post.coverImage && <Image src={post.coverImage} alt="" fill sizes="64px" className="object-cover" />}
                    </div>
                    <p className="line-clamp-2 text-sm font-medium">{post.title}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{formatDate(post.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={post.isPublished ? "success" : "outline"}>
                    {post.isPublished ? "Đã đăng" : "Nháp"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button asChild size="icon" variant="outline">
                      <Link href={`/admin/tin-tuc/${post.id}`} aria-label="Sửa">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => setToDelete(post)} aria-label="Xóa">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa bài viết này?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn sắp xóa "{toDelete?.title}". Không thể hoàn tác.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
