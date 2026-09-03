import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function MarketsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Markets"
      description="Indices, sectors, and the day's top gainers, losers, and most active."
    />
  );
}
