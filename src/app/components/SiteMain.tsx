"use client";

import { usePathname } from "next/navigation";

// Every page sits in a centered column, except the landing page (full-bleed bands) and the dashboard,
// which fills the space between the header and the bottom of the window.
export default function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/dashboard") {
    return (
      <main id="main" className="flex min-h-0 w-full flex-1 flex-col">
        {children}
      </main>
    );
  }
  if (pathname === "/") {
    return (
      <main id="main" className="w-full flex-1">
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
