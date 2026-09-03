"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CircleDollarSign,
  Star,
  BarChart3,
  Newspaper,
  SlidersHorizontal,
  ArrowLeftRight,
  PieChart,
  Bell,
  Settings,
  MessageSquareText,
  CircleHelp,
  CreditCard,
  Moon,
  Sun,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/use-theme";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const menu: NavItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutGrid },
  { label: "Portfolio", href: "/", icon: CircleDollarSign },
  { label: "Watchlists", href: "/watchlists", icon: Star },
  { label: "Markets", href: "/markets", icon: BarChart3 },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Screener", href: "/screener", icon: SlidersHorizontal },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Reports", href: "/reports", icon: PieChart },
  { label: "Alerts", href: "/alerts", icon: Bell, badge: 4 },
];

const settings: NavItem[] = [
  { label: "Pricing", href: "/pricing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Feedback", href: "/feedback", icon: MessageSquareText },
  { label: "Help Center", href: "/help", icon: CircleHelp },
];

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-muted-surface text-foreground"
          : "text-muted hover:bg-muted-surface hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0",
          active
            ? "text-foreground"
            : "text-muted-2 group-hover:text-foreground",
        )}
        strokeWidth={2}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col self-start border-r border-card-border bg-card px-4 py-6">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <div className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
          <TrendingUp className="size-5" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">
          MyPorto
        </span>
      </Link>

      {/* Menu */}
      <nav className="mt-8 flex flex-1 flex-col">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-2">
          Menu
        </p>
        <div className="flex flex-col gap-1">
          {menu.map((item) => (
            <NavRow key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>

        <p className="px-3 pb-2 pt-7 text-[11px] font-semibold uppercase tracking-wider text-muted-2">
          Help &amp; Settings
        </p>
        <div className="flex flex-col gap-1">
          {settings.map((item) => (
            <NavRow key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      {/* Theme toggle */}
      <div className="mt-4 flex items-center gap-3 px-3">
        {dark ? (
          <Sun className="size-[18px] text-muted-2" strokeWidth={2} />
        ) : (
          <Moon className="size-[18px] text-muted-2" strokeWidth={2} />
        )}
        <span className="flex-1 text-sm font-medium text-muted">
          {dark ? "Light Mode" : "Dark Mode"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={dark}
          aria-label="Toggle dark mode"
          onClick={toggle}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            dark ? "bg-brand" : "bg-muted-surface",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
              dark ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
    </aside>
  );
}
