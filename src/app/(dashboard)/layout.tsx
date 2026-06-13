import { Shell } from "@/components/layout/Shell";
import { AITutor } from "@/components/ui/ai-tutor";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Shell>{children}</Shell>
      <AITutor />
    </>
  );
}
