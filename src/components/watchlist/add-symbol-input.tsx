"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import type { SymbolSearchResult } from "@/lib/market/types";

export function AddSymbolInput({
  onAdd,
  disabled,
}: {
  onAdd: (symbol: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data, isFetching } = useQuery<SymbolSearchResult[]>({
    queryKey: ["search", debounced],
    enabled: debounced.length >= 1,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fetch(
        `/api/market/search?q=${encodeURIComponent(debounced)}`,
      );
      if (!res.ok) throw new Error(`search ${res.status}`);
      return (await res.json()).results as SymbolSearchResult[];
    },
  });

  const results = data ?? [];

  function pick(symbol: string) {
    onAdd(symbol.toUpperCase());
    setValue("");
    setDebounced("");
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) pick(value);
        }}
        className="flex items-center gap-2 rounded-xl border border-card-border bg-card px-3.5 py-2.5 focus-within:border-brand"
      >
        <Search className="size-4 shrink-0 text-muted-2" strokeWidth={2} />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Add a stock or ETF — search by ticker or name"
          disabled={disabled}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-2"
        />
        {isFetching && (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-2" />
        )}
      </form>

      {open && debounced.length >= 1 && results.length > 0 && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-card-border bg-card card-shadow">
          <ul className="max-h-72 overflow-y-auto py-1">
            {results.map((r, i) => (
              <li key={`${r.symbol}-${i}`}>
                <button
                  type="button"
                  onClick={() => pick(r.displaySymbol || r.symbol)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted-surface"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted-surface text-[10px] font-bold text-foreground">
                    {(r.displaySymbol || r.symbol).slice(0, 4)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {r.displaySymbol || r.symbol}
                    </span>
                    <span className="block truncate text-xs text-muted-2">
                      {r.description}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
