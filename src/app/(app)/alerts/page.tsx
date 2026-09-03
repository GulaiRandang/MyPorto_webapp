import { Bell } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function AlertsPage() {
  return (
    <ComingSoon
      icon={Bell}
      title="Alerts"
      description="Price and percentage alerts delivered by email."
    />
  );
}
