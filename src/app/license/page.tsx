import type { Metadata } from "next";
import Link from "next/link";
import { licenseText } from "@/lib/pages-data";
import { REPO_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "License",
  description: "The licence the GSOP code and data build are released under, shown exactly as committed in the repository.",
};

const link = "underline underline-offset-4";

export default function Page() {
  return (
    <article className="max-w-3xl space-y-6">
      <h1 className="text-3xl">License</h1>
      <p className="text-secondary-foreground">
        This is the LICENSE file from the repository, unchanged. Data from outside sources keeps the licence of its provider; see{" "}
        <Link href="/data-sources" className={link}>
          data sources
        </Link>
        . The repository is on{" "}
        <a href={REPO_URL} className={link}>
          GitHub
        </a>
        .
      </p>
      <pre className="overflow-x-auto whitespace-pre-wrap border border-border bg-surface p-4 font-mono text-sm leading-relaxed" data-testid="license-text">
        {licenseText()}
      </pre>
    </article>
  );
}
