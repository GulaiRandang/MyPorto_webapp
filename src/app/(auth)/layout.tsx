import { TrendingUp } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
            <TrendingUp className="size-5" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            MyPorto
          </span>
        </div>
        <div className="rounded-card border border-card-border bg-card p-6 card-shadow">
          {children}
        </div>
      </div>
    </div>
  );
}
