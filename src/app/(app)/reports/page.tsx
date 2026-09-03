import { PieChart } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function ReportsPage() {
  return (
    <ComingSoon
      icon={PieChart}
      title="Reports"
      description="Allocation, realized gains, and performance versus benchmarks."
    />
  );
}
