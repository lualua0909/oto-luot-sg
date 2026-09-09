"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Newspaper, MessageSquare, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllCarsAdmin } from "@/lib/firebase/cars";
import { getAllNewsAdmin } from "@/lib/firebase/news";
import { getAllLeadsAdmin } from "@/lib/firebase/leads";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ cars: 0, carsSelling: 0, news: 0, newLeads: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [cars, news, leads] = await Promise.all([
          getAllCarsAdmin(),
          getAllNewsAdmin(),
          getAllLeadsAdmin(),
        ]);
        setStats({
          cars: cars.length,
          carsSelling: cars.filter((c) => c.status === "dang-ban").length,
          news: news.length,
          newLeads: leads.filter((l) => l.status === "moi").length,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Xe đang bán", value: stats.carsSelling, sub: `${stats.cars} xe tổng cộng`, icon: Car, href: "/admin/xe" },
    { label: "Bài viết", value: stats.news, sub: "kiến thức đã đăng", icon: Newspaper, href: "/admin/tin-tuc" },
    { label: "Yêu cầu tư vấn mới", value: stats.newLeads, sub: "cần liên hệ lại", icon: MessageSquare, href: "/admin/lien-he" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">Chào mừng quay lại trang quản trị.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/admin/xe/moi">
              <Plus className="h-4 w-4" /> Thêm xe
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/tin-tuc/moi">
              <Plus className="h-4 w-4" /> Viết bài
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="font-display text-3xl font-bold">{c.value}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
