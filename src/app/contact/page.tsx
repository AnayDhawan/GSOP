import type { Metadata } from "next";
import Band from "../components/Band";
import PageHero from "../components/PageHero";
import { CONTACT_EMAIL, REPO_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the GSOP team: email, GitHub profiles and the project repository.",
};

const link = "underline underline-offset-4";

type Member = { name: string; email?: string; github?: string };

const TEAM: Member[] = [
  { name: "Yash Kewlani", github: "yakew7" },
  { name: "Anay Dhawan", email: CONTACT_EMAIL, github: "AnayDhawan" },
  { name: "Vihaan Bhagwat" },
  { name: "Shiven Sood" },
  { name: "Shaurya Jani" },
  { name: "Shaurya Gangrade" },
];

const INCLUDE = [
  "Spotted a data error? Name the site or tile and the source that disagrees.",
  "Method question? Point to the page and the gate or limit you mean.",
  "Field measurements for an analog site? Say where, when and how you measured, and whether we can share them.",
  "Research organisation or press? Tell us what you want to use the data for.",
];

export default function Page() {
  return (
    <>
      <PageHero title="Contact" lede="GSOP is built by a small student team. Email is the fastest way to reach us, and an issue on the repository works too." />

      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex min-h-12 items-center border border-foreground bg-surface px-5 py-2 font-display text-lg hover:bg-surface-raised">
            {CONTACT_EMAIL}
          </a>
          <h2 className="text-xl">What to put in the message</h2>
          <ul className="space-y-3 text-secondary-foreground">
            {INCLUDE.map((t) => (
              <li key={t} className="border-l-2 border-border pl-3">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl">Team</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {TEAM.map((m) => (
              <li key={m.name} className="border border-border bg-surface p-4">
                <p className="font-display text-lg">{m.name}</p>
                {m.email || m.github ? (
                  <p className="mt-1 space-y-1 text-sm text-secondary-foreground">
                    {m.email ? (
                      <a href={`mailto:${m.email}`} className={`block ${link}`}>
                        {m.email}
                      </a>
                    ) : null}
                    {m.github ? (
                      <a href={`https://github.com/${m.github}`} className={`block ${link}`} target="_blank" rel="noopener noreferrer">
                        github.com/{m.github}
                      </a>
                    ) : null}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Band tone="raised" labelledBy="repo">
        <h2 id="repo" className="mb-3 text-xl">
          Project repository
        </h2>
        <p>
          Code, the data build and the issue tracker are at{" "}
          <a href={REPO_URL} className={link} target="_blank" rel="noopener noreferrer">
            {REPO_URL.replace("https://", "")}
          </a>
          .
        </p>
      </Band>
    </>
  );
}
