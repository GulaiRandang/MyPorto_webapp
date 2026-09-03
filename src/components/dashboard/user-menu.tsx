"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/plan";

export function UserMenu({ email, plan }: { email: string; plan: Plan }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = email.slice(0, 2).toUpperCase();
  const isPro = plan === "pro";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-xl border border-card-border py-1.5 pl-1.5 pr-3 transition-colors hover:bg-muted-surface"
      >
        <span className="grid size-9 place-items-center rounded-lg bg-brand text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block max-w-[140px] truncate text-sm font-semibold text-foreground">
            {email}
          </span>
          <span className="block text-xs text-muted-2">
            {isPro ? "Pro plan" : "Free plan"}
          </span>
        </span>
        <ChevronDown className="size-4 text-muted-2" strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-card-border bg-card card-shadow">
          <p className="border-b border-hairline px-4 py-3 text-xs text-muted-2">
            Signed in as
            <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
              {email}
            </span>
            <span
              className={cn(
                "mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                isPro
                  ? "bg-success-surface text-success"
                  : "bg-muted-surface text-muted",
              )}
            >
              {isPro ? "Pro" : "Free"}
            </span>
          </p>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted-surface"
          >
            <CreditCard className="size-4 text-muted-2" strokeWidth={2} />
            {isPro ? "Manage plan" : "Upgrade to Pro"}
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 border-t border-hairline px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted-surface"
            >
              <LogOut className="size-4 text-muted-2" strokeWidth={2} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
