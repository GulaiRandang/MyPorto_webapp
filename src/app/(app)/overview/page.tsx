import { LayoutGrid } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function OverviewPage() {
  return (
    <ComingSoon
      icon={LayoutGrid}
      title="Overview"
      description="A snapshot of your accounts, performance, and market movers."
    />
  );
}
