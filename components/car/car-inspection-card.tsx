import { CalendarCheck2, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import type { Car } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function CarInspectionCard({ car }: { car: Car }) {
  if (!car.isVerified && !car.inspectionItems?.length && !car.inspectionSummary) return null;

  return (
    <section className="rounded-2xl border border-success/25 bg-success/5 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10"><ShieldCheck className="h-5 w-5 text-success" /></span>
          <div>
            <h2 className="font-display text-lg font-bold">Thông tin kiểm tra xe</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Nội dung dưới đây phản ánh dữ liệu kiểm tra được showroom cung cấp cho chiếc xe này.</p>
          </div>
        </div>
        {car.inspectionDate && <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"><CalendarCheck2 className="h-4 w-4" /> {formatDate(car.inspectionDate)}</span>}
      </div>

      {car.inspectionItems && car.inspectionItems.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {car.inspectionItems.map((item) => <li key={item} className="flex gap-2 text-sm leading-6"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" /> {item}</li>)}
        </ul>
      ) : (
        <p className="mt-5 rounded-xl bg-white/70 p-4 text-sm leading-6 text-muted-foreground">Xe đang được gắn nhãn “Đã kiểm định”. Liên hệ showroom để xem phạm vi kiểm tra và hồ sơ thực tế trước khi quyết định.</p>
      )}

      {car.inspectionSummary && <div className="mt-5 border-t border-success/15 pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-success">Ghi chú kết quả</p><p className="mt-2 whitespace-pre-line text-sm leading-6">{car.inspectionSummary}</p></div>}
      <div className="mt-5 flex flex-wrap gap-3">
        {car.inspectionReportUrl && <a href={car.inspectionReportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-bold text-white hover:bg-success/90">Xem báo cáo <ExternalLink className="h-4 w-4" /></a>}
        {car.allowsIndependentInspection && <span className="inline-flex items-center rounded-lg border border-success/25 bg-white px-4 py-2.5 text-sm font-semibold text-success">Có thể đề nghị kiểm tra độc lập</span>}
      </div>
    </section>
  );
}
