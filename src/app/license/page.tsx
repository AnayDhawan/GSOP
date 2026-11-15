import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../components/PageHero";
import { licenseText } from "@/lib/pages-data";
import { REPO_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Licence",
  description: "The licence the GSOP code and data build are released under, shown exactly as committed in the repository.",
};

const link = "underline underline-offset-4";

export default function Page() {
  return (
    <>
      <PageHero title="Licence" lede="The LICENSE file from the repository, unchanged." />
      <div className="grid items-start gap-10 md:grid-cols-[1.6fr_1fr]">
        <pre className="overflow-x-auto whitespace-pre-wrap border border-border bg-surface p-5 font-mono text-sm leading-relaxed" data-testid="license-text">
          {licenseText()}
        </pre>
        <aside className="space-y-4 border-t-4 border-earth pt-5">
          <h2 className="text-xl">Data from other sources</h2>
          <p className="text-secondary-foreground">
            The licence covers our code and the data build. Data we pull from outside keeps the licence of its provider. The{" "}
            <Link href="/data-sources" className={link}>
              data sources page
            </Link>{" "}
            names each one.
          </p>
          <p className="text-secondary-foreground">
            The repository is on{" "}
            <a href={REPO_URL} className={link} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            .
          </p>
        </aside>
      </div>
    </>
  );
}
