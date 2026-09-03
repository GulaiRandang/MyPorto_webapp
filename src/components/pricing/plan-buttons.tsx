"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

async function post(url: string): Promise<string | null> {
  const res = await fetch(url, { method: "POST" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    throw new Error(json.error || `request failed (${res.status})`);
  }
  return json.url as string;
}

export function UpgradeButton({ label = "Upgrade to Pro" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const url = await post("/api/stripe/checkout");
            if (url) window.location.href = url;
          } catch (e) {
            setError((e as Error).message);
            setLoading(false);
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {label}
      </button>
      {error && (
        <p className="mt-2 text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  );
}

export function ManageButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const url = await post("/api/stripe/portal");
            if (url) window.location.href = url;
          } catch (e) {
            setError((e as Error).message);
            setLoading(false);
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-card-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted-surface disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Manage billing
      </button>
      {error && (
        <p className="mt-2 text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  );
}
