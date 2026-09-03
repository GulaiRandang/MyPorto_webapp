"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/": "Portfolio",
  "/overview": "Overview",
  "/watchlists": "Watchlists",
  "/markets": "Markets",
  "/news": "News",
  "/screener": "Screener",
  "/transactions": "Transactions",
  "/reports": "Reports",
  "/alerts": "Alerts",
  "/pricing": "Pricing",
  "/settings": "Settings",
  "/feedback": "Feedback",
  "/help": "Help Center",
};

export function PageTitle() {
  const pathname = usePathname();
  const key =
    Object.keys(TITLES).find(
      (k) => k !== "/" && (pathname === k || pathname.startsWith(`${k}/`)),
    ) ?? "/";
  return (
    <h1 className="text-xl font-bold tracking-tight text-foreground">
      {TITLES[key]}
    </h1>
  );
}
