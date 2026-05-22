import { DashboardSection } from "@/components/sections/DashboardSection";
import { GoalsSection } from "@/components/sections/GoalsSection";
import { ProductivitySection } from "@/components/sections/ProductivitySection";

export default function Home() {
  return (
    <>
      <DashboardSection />
      <ProductivitySection />
      <GoalsSection />
    </>
  );
}
