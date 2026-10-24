"use client";

import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatVnd(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")} đ`;
}

export function LoanCalculator({ initialPriceTrieu = 500, compact = false }: { initialPriceTrieu?: number; compact?: boolean }) {
  const [price, setPrice] = useState(initialPriceTrieu);
  const [downPercent, setDownPercent] = useState(30);
  const [months, setMonths] = useState(60);
  const [annualRate, setAnnualRate] = useState(9);
  const result = useMemo(() => {
    const principal = Math.max(0, price * 1_000_000 * (1 - downPercent / 100));
    const monthlyRate = Math.max(0, annualRate) / 100 / 12;
    const payment = monthlyRate === 0 ? principal / Math.max(1, months) : principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return { downPayment: price * 1_000_000 * downPercent / 100, principal, payment: Number.isFinite(payment) ? payment : 0 };
  }, [price, downPercent, months, annualRate]);

  return (
    <section className={compact ? "" : "container-page py-16"}>
      <div className={`overflow-hidden border border-border bg-card shadow-card ${compact ? "rounded-2xl" : "rounded-3xl"}`}>
        <div className={compact ? "grid" : "grid lg:grid-cols-[.85fr_1.15fr]"}>
          <div className={`bg-primary text-primary-foreground ${compact ? "p-5" : "p-7 sm:p-9"}`}>
            <div className={compact ? "flex items-center gap-2.5" : ""}>
              <Calculator className={compact ? "h-6 w-6 text-accent" : "h-8 w-8 text-accent"} />
              <h2 className={compact ? "font-display text-lg font-bold" : "mt-4 font-display text-2xl font-bold"}>Ước tính khoản trả góp</h2>
            </div>
            <p className={compact ? "hidden" : "mt-3 text-sm leading-6 text-primary-foreground/75"}>Điều chỉnh giá xe, số tiền trả trước, thời hạn và lãi suất dự kiến để tham khảo khoản thanh toán hàng tháng.</p>
            <div className={`rounded-2xl bg-white/10 ${compact ? "mt-4 p-4" : "mt-7 p-5"}`}>
              <p className="text-xs text-primary-foreground/65">Khoản trả hàng tháng dự kiến</p>
              <p className={`mt-1 font-display font-extrabold text-accent ${compact ? "text-2xl" : "text-3xl"}`}>{formatVnd(result.payment)}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-primary-foreground/60">Trả trước</p><p className="mt-1 font-semibold">{formatVnd(result.downPayment)}</p></div>
                <div><p className="text-primary-foreground/60">Khoản vay</p><p className="mt-1 font-semibold">{formatVnd(result.principal)}</p></div>
              </div>
            </div>
          </div>
          <div className={compact ? "grid grid-cols-2 gap-4 p-5" : "grid gap-5 p-7 sm:grid-cols-2 sm:p-9"}>
            <div className="space-y-2"><Label htmlFor="loan-price">Giá xe (triệu đồng)</Label><Input id="loan-price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} /></div>
            <div className="space-y-2"><Label htmlFor="loan-down">Trả trước (%)</Label><Input id="loan-down" type="number" min={0} max={90} value={downPercent} onChange={(e) => setDownPercent(Math.min(90, Math.max(0, Number(e.target.value) || 0)))} /></div>
            <div className="space-y-2"><Label htmlFor="loan-term">Thời hạn vay (tháng)</Label><Input id="loan-term" type="number" min={6} max={96} value={months} onChange={(e) => setMonths(Math.min(96, Math.max(6, Number(e.target.value) || 6)))} /></div>
            <div className="space-y-2"><Label htmlFor="loan-rate">Lãi suất dự kiến (%/năm)</Label><Input id="loan-rate" type="number" min={0} max={30} step="0.1" value={annualRate} onChange={(e) => setAnnualRate(Math.min(30, Math.max(0, Number(e.target.value) || 0)))} /></div>
            <p className={`flex gap-2 text-xs leading-5 text-muted-foreground ${compact ? "col-span-2" : "sm:col-span-2"}`}><Info className="mt-0.5 h-4 w-4 shrink-0" /> Kết quả chỉ là ước tính theo dư nợ cố định. Khoản vay, lãi suất, phí và điều kiện phê duyệt thực tế do ngân hàng xác định theo từng hồ sơ.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
