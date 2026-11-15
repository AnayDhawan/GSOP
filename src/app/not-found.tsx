import Link from "next/link";
import PageHero from "./components/PageHero";

export default function NotFound() {
  return (
    <>
      <PageHero title="Page not found" lede="That address does not match a page on this site." />
      <p className="flex flex-wrap gap-x-8 gap-y-2 font-display text-lg">
        <Link href="/" className="underline underline-offset-4">
          Back to the home page
        </Link>
        <Link href="/dashboard" className="underline underline-offset-4">
          Open the dashboard
        </Link>
      </p>
    </>
  );
}
