"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import type { SymbolSearchResult } from "@/lib/market/types";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
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

  return (
    <div ref={boxRef} className="relative">
      <div className="flex w-64 items-center gap-2 rounded-xl border border-card-border px-3 py-2 text-sm text-muted focus-within:border-brand">
        <Search className="size-4 shrink-0 text-muted-2" strokeWidth={2} />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search stocks, ETFs…"
          className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-2"
        />
        {isFetching && (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-2" />
        )}
      </div>

      {open && debounced.length >= 1 && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-card-border bg-card card-shadow">
          {results.length === 0 && !isFetching ? (
            <p className="px-4 py-3 text-sm text-muted-2">No matches</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((r, index) => (
                <li key={`${r.symbol}-${index}`}>
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: route to /markets/[symbol] once the page exists.
                      setValue(r.symbol);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted-surface"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted-surface text-[10px] font-bold text-foreground">
                      {r.displaySymbol.slice(0, 4)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">
                        {r.displaySymbol}
                      </span>
                      <span className="block truncate text-xs text-muted-2">
                        {r.description}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
