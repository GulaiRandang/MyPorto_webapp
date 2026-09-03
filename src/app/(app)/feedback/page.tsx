import { MessageSquareText } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function FeedbackPage() {
  return (
    <ComingSoon
      icon={MessageSquareText}
      title="Feedback"
      description="Tell us what would make MyPorto more useful."
    />
  );
}
