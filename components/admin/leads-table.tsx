"use client";

import { useEffect, useState } from "react";
import { Eye, Trash2, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
                <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                  <p className="line-clamp-2 break-words">{lead.message || "—"}</p>
                  {lead.carTitle && <p className="mt-0.5 text-xs text-primary">Xe: {lead.carTitle}</p>}
                  {lead.message && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Xem đầy đủ
                    </Button>
                  )}
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

      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nội dung yêu cầu tư vấn</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 rounded-lg bg-muted/60 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Khách hàng</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Số điện thoại</p>
                  <a href={`tel:${selectedLead.phone}`} className="font-medium text-primary hover:underline">
                    {selectedLead.phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chủ đề</p>
                  <p className="font-medium">{selectedLead.topic}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ngày gửi</p>
                  <p className="font-medium">{formatDate(selectedLead.createdAt)}</p>
                </div>
                {selectedLead.carTitle && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Xe quan tâm</p>
                    <p className="font-medium text-primary">{selectedLead.carTitle}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Nội dung</p>
                <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{selectedLead.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
