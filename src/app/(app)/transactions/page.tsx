import { ArrowLeftRight } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function TransactionsPage() {
  return (
    <ComingSoon
      icon={ArrowLeftRight}
      title="Transactions"
      description="Every buy, sell, dividend, and transfer across your portfolios."
    />
  );
}
