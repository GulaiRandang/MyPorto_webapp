import { SlidersHorizontal } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function ScreenerPage() {
  return (
    <ComingSoon
      icon={SlidersHorizontal}
      title="Screener"
      description="Filter stocks and ETFs by fundamentals, price, and performance."
    />
  );
}
