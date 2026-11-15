// Single list of routes. The header, footer and tests read it, so a route cannot be missing from one of them.
export type NavItem = { href: string; label: string; description: string };

/** Header links, in order. The theme toggle sits to the right of them. */
export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", description: "Reference sites ranked by similarity, Moon and Mars" },
  { href: "/method", label: "Methodology", description: "How the screening works, and what it cannot tell you" },
  { href: "/mission", label: "Mission", description: "Why this exists and who it is for" },
  { href: "/contribute", label: "Contribute", description: "Send field measurements and source corrections" },
  { href: "/contact", label: "Contact", description: "The team and how to reach us" },
];

/** Results pages that are not in the header. They are linked from the landing page and the footer. */
export const RESULTS: NavItem[] = [
  { href: "/gates", label: "Gate results", description: "Which pre-registered gates failed, with the one positive result" },
  { href: "/ledger", label: "Failure-First Ledger", description: "What failed and where the analogy breaks down" },
  { href: "/sites", label: "Sites", description: "Reference sites and candidates, with the stored score at each" },
  { href: "/map", label: "Honest Map", description: "Where v1 scores high, with the controls that failed in red" },
];

export const FOOTER_QUICK: NavItem[] = NAV.slice(0, 4);

export const FOOTER_LEGAL: NavItem[] = [
  { href: "/license", label: "License", description: "The repository licence, verbatim" },
  { href: "/data-sources", label: "Data sources", description: "Every source, what it gave us, and its caveats" },
  { href: "/disclaimers", label: "Disclaimers", description: "What this site is not" },
];

export const REPO_URL = "https://github.com/AnayDhawan/GSOP";
export const CONTACT_EMAIL = "dhawansanay@gmail.com";

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
