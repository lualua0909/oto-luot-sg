import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
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
          <span className="h-px w-6 bg-accent/60" />
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      {description && (
        <p className={cn("mt-2 max-w-2xl text-muted-foreground", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
