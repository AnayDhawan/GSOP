"use client";

import { usePathname } from "next/navigation";

// Hides its children on the dashboard, which is a full-height app with its own status line.
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname === "/dashboard" ? null : <>{children}</>;
}
