import { NotBuiltYet } from "@/components/not-built-yet";

export default function CasesPage() {
  return (
    <NotBuiltYet
      title="Clinical Cases"
      subtitle="Presentation → differential → stabilization → investigations → management → follow-up."
      reason="Not built yet — clinical cases need original authorship grounded in the reference library (Part 14 of the spec), not just re-formatted QBank questions. This is next after the textbook cross-reference pass."
    />
  );
}
