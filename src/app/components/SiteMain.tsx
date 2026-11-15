"use client";

import { usePathname } from "next/navigation";

// Every page sits in a centered column, except the dashboard, which fills the space between the header and the bottom of the window.
export default function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/dashboard") {
    return (
      <main id="main" className="flex min-h-0 w-full flex-1 flex-col">
        {children}
      </main>
    );
  }
  return (
    <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      {children}
    </main>
  );
}
