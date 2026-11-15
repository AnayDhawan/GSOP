import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";
import { dashboardData } from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Reference sites ranked by stored similarity score against Moon and Mars targets, with the status of each result.",
};

export default function DashboardPage() {
  return <DashboardClient data={dashboardData()} />;
}
