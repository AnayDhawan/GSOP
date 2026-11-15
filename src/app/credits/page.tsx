import type { Metadata } from "next";
import Link from "next/link";
import Band from "../components/Band";
import PageHero from "../components/PageHero";

export const metadata: Metadata = { title: "Data credits", description: "The open datasets behind the GSOP scores, grouped by Earth, Moon and Mars." };

const GROUPS: { title: string; image: string; alt: string; tone: "plain" | "raised" | "grid"; items: string[] }[] = [
  {
    title: "Earth",
    image: "/img/bodies/earth.jpg",
    alt: "Earth, seen as a full disc with Africa and Europe facing the viewer",
    tone: "plain",
    items: [
      "Elevation: SRTM (CGIAR-CSI version) and the Copernicus DEM GLO30 beyond its coverage (attribution to DLR and Airbus).",
      "Land cover and vegetation gates: MODIS MCD12Q1 and MOD13A2 (NASA LP DAAC), read through Google Earth Engine.",
      "Air density: the NASA Glenn atmosphere model.",
      "India outline for labels, and region names (deserts, plateaus, ranges and populated places): Natural Earth, public domain. The outline is not an official map.",
    ],
  },
  {
    title: "Moon",
    image: "/img/bodies/moon.jpg",
    alt: "The Moon, a grey disc covered in craters and darker basalt plains",
    tone: "raised",
    items: [
      "LOLA south-polar elevation and permanently shadowed region maps (NASA PGDA; Barker et al., Planetary Science Journal).",
      "Lighting and shadow statistics for the two targets: Glaser et al.",
    ],
  },
  {
    title: "Mars",
    image: "/img/bodies/mars.jpg",
    alt: "Mars, a rust-red disc with dark regions and a pale polar cap",
    tone: "grid",
    items: [
      "MOLA elevation (USGS Astrogeology).",
      "Jezero thermal inertia and the Mars Climate Database: used to set target values, not scored.",
      "Solar constants and atmosphere: NASA Mars fact sheet and NASA Glenn Mars model. Jezero location: Grant et al.",
    ],
  },
];

export default function Page() {
  return (
    <>
      <PageHero title="Data credits" lede="GSOP is built on open data. These are the sources, grouped by the body each one describes." />
      <p className="max-w-2xl text-secondary-foreground">
        Licence wording is taken from the v1 provenance record and is still to be checked against each catalogue page. For the full table with links, resolution and caveats, see{" "}
        <Link href="/data-sources" className="underline underline-offset-4">
          data sources
        </Link>
        .
      </p>
      {GROUPS.map((g) => (
        <Band key={g.title} tone={g.tone} labelledBy={`credits-${g.title}`}>
          <div className="grid items-center gap-8 md:grid-cols-[14rem_1fr]">
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.image} alt={g.alt} width={600} height={600} loading="lazy" className="mx-auto aspect-square w-48 rounded-full object-cover md:w-56" />
            </figure>
            <div data-left className="space-y-3">
              <h2 id={`credits-${g.title}`} className="text-3xl">
                {g.title}
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                {g.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Band>
      ))}
    </>
  );
}
