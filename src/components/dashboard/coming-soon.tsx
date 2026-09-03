import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="grid size-14 place-items-center rounded-2xl border border-card-border bg-card text-muted-2 card-shadow">
        <Icon className="size-6" strokeWidth={1.75} />
      </div>
      <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      <span className="mt-4 rounded-full border border-card-border px-3 py-1 text-xs font-medium text-muted-2">
        Coming soon
      </span>
    </div>
  );
}
