import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
        {eyebrow}
      </p>
      <h3 className="text-lg sm:text-2xl font-semibold">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
