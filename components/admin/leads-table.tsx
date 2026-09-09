"use client";

import { useEffect, useState } from "react";
import { Trash2, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead } from "@/lib/types";
import { getAllLeadsAdmin, updateLeadStatus, deleteLead } from "@/lib/firebase/leads";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS: { value: Lead["status"]; label: string; variant: "secondary" | "accent" | "success" }[] = [
  { value: "moi", label: "Mới", variant: "accent" },
  { value: "da-lien-he", label: "Đã liên hệ", variant: "secondary" },
  { value: "da-xong", label: "Hoàn tất", variant: "success" },
];

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLeads(await getAllLeadsAdmin());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleStatusChange(lead: Lead, status: Lead["status"]) {
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    try {
      await updateLeadStatus(lead.id, status);
    } catch {
      toast.error("Không thể cập nhật trạng thái.");
    }
  }

  async function handleDelete(lead: Lead) {
    if (!confirm(`Xóa yêu cầu tư vấn từ "${lead.name}"?`)) return;
    try {
      await deleteLead(lead.id);
      setLeads((ls) => ls.filter((l) => l.id !== lead.id));
      toast.success("Đã xóa.");
    } catch {
      toast.error("Xóa thất bại.");
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold">Yêu cầu tư vấn</h1>
        <p className="text-sm text-muted-foreground">{leads.length} yêu cầu từ khách hàng</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Chưa có yêu cầu tư vấn nào.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Phone className="h-3 w-3" /> {lead.phone}
                  </a>
                </TableCell>
                <TableCell className="text-sm">{lead.topic}</TableCell>
                <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                  <p className="line-clamp-2">{lead.message || "—"}</p>
                  {lead.carTitle && <p className="mt-0.5 text-xs text-primary">Xe: {lead.carTitle}</p>}
                </TableCell>
                <TableCell className="text-sm">{formatDate(lead.createdAt)}</TableCell>
                <TableCell>
                  <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead, v as Lead["status"])}>
                    <SelectTrigger className="h-9 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="outline" onClick={() => handleDelete(lead)} aria-label="Xóa">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
