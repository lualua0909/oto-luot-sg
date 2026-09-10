import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { T } from "@/components/shared/editable-text";

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  icon: Icon,
  className,
}: {
  /**
   * Content key prefix — the three lines are stored as `<id>.eyebrow|title|description`.
   * Omit it for headings built from dynamic data (e.g. a brand name), which must not
   * be frozen to a single edited value.
   */
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Optional lucide icon shown next to the eyebrow. */
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent",
            align === "center" && "justify-center"
          )}
        >
          {Icon ? <Icon className="h-4 w-4" /> : <span className="h-px w-6 bg-accent/60" />}
          {id ? <T id={`${id}.eyebrow`}>{eyebrow}</T> : eyebrow}
        </p>
      )}
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{id ? <T id={`${id}.title`}>{title}</T> : title}</h2>
      {description && (
        <p className={cn("mt-2 max-w-2xl text-muted-foreground", align === "center" && "mx-auto")}>
          {id ? <T id={`${id}.description`}>{description}</T> : description}
        </p>
      )}
    </div>
  );
}
