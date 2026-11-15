import type { Metadata } from "next";
import { REPO_URL } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the GSOP team: email, GitHub profiles and the project repository.",
};

const link = "underline underline-offset-4";
const EMAIL = "dhawansanay@gmail.com";

export default function Page() {
  return (
    <article className="max-w-3xl space-y-8">
      <h1 className="text-3xl">Contact</h1>
      <p className="text-secondary-foreground">GSOP is built by a small student team. The fastest way to reach us is email, or an issue on the repository.</p>
      <p>
        <a href={`mailto:${EMAIL}`} className="inline-flex min-h-11 items-center border border-border bg-surface px-5 py-2 font-medium hover:bg-surface-raised">
          {EMAIL}
        </a>
      </p>

      <section className="space-y-3" aria-labelledby="include">
        <h2 id="include" className="text-xl">
          What to include
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Spotted a data error? Name the site or tile and the source that disagrees.</li>
          <li>Method question? Point to the page and the gate or limit you mean.</li>
          <li>Have field measurements for an analog site? Say where, when, how it was measured and whether it can be shared.</li>
          <li>Research organisation or press: say what you want to use the data for.</li>
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="team">
        <h2 id="team" className="text-xl">
          Team
        </h2>
        <ul className="space-y-3">
          <li>
            <p className="font-medium">Anay Dhawan</p>
            <p className="text-secondary-foreground">
              <a href={`mailto:${EMAIL}`} className={link}>
                {EMAIL}
              </a>
              {" "}
              ·{" "}
              <a href="https://github.com/AnayDhawan" className={link} rel="noopener noreferrer">
                github.com/AnayDhawan
              </a>
            </p>
          </li>
          <li>
            <p className="font-medium">Yash</p>
            <p className="text-secondary-foreground">
              <a href="https://github.com/yakew7" className={link} rel="noopener noreferrer">
                github.com/yakew7
              </a>
            </p>
          </li>
          <li>
            <p className="font-medium">Vihaan</p>
          </li>
          <li>
            <p className="font-medium">Shiven</p>
          </li>
          <li>
            <p className="font-medium">Shaurya</p>
          </li>
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="repo">
        <h2 id="repo" className="text-xl">
          Project repository
        </h2>
        <p>
          Code, data build and issues:{" "}
          <a href={REPO_URL} className={link} rel="noopener noreferrer">
            {REPO_URL.replace("https://", "")}
          </a>
        </p>
      </section>
    </article>
  );
}
