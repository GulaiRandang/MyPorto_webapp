import { CircleHelp } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function HelpPage() {
  return (
    <ComingSoon
      icon={CircleHelp}
      title="Help Center"
      description="Guides and answers for getting the most out of MyPorto."
    />
  );
}
