"use client";

import { useEffect, useState } from "react";
import { Eye, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Item = { label: string; pageviews: number; visitors: number };
type Data = {
  total: { pageviews: number; visitors: number };
  daily: { date: string; pageviews: number; visitors: number }[];
  pages: Item[];
  referrers: Item[];
  devices: Item[];
};

const LABELS: Record<string, string> = { mobile: "Điện thoại", desktop: "Máy tính", tablet: "Máy tính bảng", Others: "Khác" };

export function AnalyticsPanel() {
  const [days, setDays] = useState<7 | 30>(7);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    setSelected(null);
    fetch(`/api/analytics?days=${days}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setData(json);
      })
      .catch((e: Error) => setError(e.message));
  }, [days]);

  const maxDaily = Math.max(1, ...(data?.daily.map((d) => d.pageviews) ?? []));
  const selectedDay = data?.daily.find((d) => d.date === selected);

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Lượt truy cập</h2>
        <div className="flex gap-1">
          {([7, 30] as const).map((d) => (
            <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>
              {d} ngày
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">Không tải được số liệu: {error}</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row flex-wrap items-center gap-6 space-y-0 pb-2">
              <Stat icon={Eye} label="Lượt xem trang" value={data?.total.pageviews} />
              <Stat icon={Users} label="Khách truy cập" value={data?.total.visitors} />
              {selectedDay && (
                <div className="ml-auto rounded-md bg-muted px-3 py-2 text-sm">
                  <p className="font-medium">
                    {new Date(selectedDay.date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{selectedDay.pageviews.toLocaleString("vi-VN")}</span> lượt xem ·{" "}
                    <span className="font-semibold text-foreground">{selectedDay.visitors.toLocaleString("vi-VN")}</span> khách
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {data ? (
                <div className="flex h-40 items-end gap-1">
                  {data.daily.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      aria-label={`${new Date(d.date).toLocaleDateString("vi-VN")}: ${d.pageviews} lượt xem, ${d.visitors} khách`}
                      aria-pressed={d.date === selected}
                      onClick={() => setSelected(d.date === selected ? null : d.date)}
                      className={`flex-1 rounded-t transition-colors hover:bg-primary ${
                        d.date === selected ? "bg-primary" : selected ? "bg-primary/40" : "bg-primary/80"
                      }`}
                      style={{ height: `${Math.max(2, (d.pageviews / maxDaily) * 100)}%` }}
                    />
                  ))}
                </div>
              ) : (
                <Skeleton className="h-40 w-full" />
              )}
            </CardContent>
          </Card>

          <RankList title="Thiết bị" items={data?.devices.map((i) => ({ ...i, label: LABELS[i.label] ?? i.label }))} />
          <RankList title="Trang xem nhiều" items={data?.pages.map((i) => ({ ...i, label: LABELS[i.label] ?? i.label }))} className="lg:col-span-2" />
          <RankList title="Nguồn truy cập" items={data?.referrers.map((i) => ({ ...i, label: i.label ? LABELS[i.label] ?? i.label : "Truy cập trực tiếp" }))} />
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value?: number }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" /> {label}
      </p>
      {value === undefined ? (
        <Skeleton className="mt-1 h-8 w-20" />
      ) : (
        <p className="font-display text-3xl font-bold">{value.toLocaleString("vi-VN")}</p>
      )}
    </div>
  );
}

function RankList({ title, items, className }: { title: string; items?: Item[]; className?: string }) {
  const max = Math.max(1, ...(items?.map((i) => i.pageviews) ?? []));
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {!items ? (
          <Skeleton className="h-24 w-full" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
        ) : (
          items.map((i) => (
            <div key={i.label} className="relative flex items-center justify-between gap-3 rounded px-2 py-1 text-sm">
              <div className="absolute inset-y-0 left-0 rounded bg-primary/10" style={{ width: `${(i.pageviews / max) * 100}%` }} />
              <span className="relative truncate">{i.label}</span>
              <span className="relative font-medium tabular-nums">{i.pageviews.toLocaleString("vi-VN")}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
