import { Newspaper } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function NewsPage() {
  return (
    <ComingSoon
      icon={Newspaper}
      title="News"
      description="Headlines for your holdings and the broader market, from Finnhub."
    />
  );
}
