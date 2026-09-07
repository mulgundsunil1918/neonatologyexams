import { NotBuiltYet } from "@/components/not-built-yet";

export default function AnalyticsPage() {
  return (
    <NotBuiltYet
      title="Analytics"
      subtitle="Deeper trends over time — accuracy by week, time-per-question, streaks."
      reason="The Dashboard already covers current-state progress and system performance. Trend-over-time analytics needs attempt history to accumulate first — come back once you've solved a few papers."
    />
  );
}
