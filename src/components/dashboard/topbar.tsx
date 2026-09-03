import { Bell } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getPlan } from "@/lib/plan";
import { SearchCommand } from "./search-command";
import { UserMenu } from "./user-menu";
import { PageTitle } from "./page-title";

export async function Topbar() {
  const [user, plan] = await Promise.all([getUser(), getPlan()]);
  const email = user?.email ?? "account@myporto.app";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-card-border bg-card px-8 py-4">
      <PageTitle />

      <div className="flex items-center gap-3">
        <SearchCommand />
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-11 place-items-center rounded-xl border border-card-border text-muted transition-colors hover:bg-muted-surface"
        >
          <Bell className="size-[18px]" strokeWidth={2} />
          <span className="absolute right-3 top-3 size-2 rounded-full bg-danger ring-2 ring-card" />
        </button>
        <UserMenu email={email} plan={plan} />
      </div>
    </header>
  );
}
