import type { ReactNode } from "react";

/* Title band for every page except the landing page and the dashboard, in outer space like the landing hero. The header floats over
   its top edge, so it keeps room for it. It breaks out of the centred page column (SiteMain), so a page
   renders <PageHero> first and the rest of its content below it as normal. */
export default function PageHero({ title, lede, children, id = "page-title" }: { title: string; lede?: ReactNode; children?: ReactNode; id?: string }) {
  return (
    <section data-theme="dark" aria-labelledby={id} className="page-hero relative left-1/2 -mt-10 mb-10 w-screen -translate-x-1/2 overflow-hidden border-b border-border text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-28 md:pb-20 md:pt-36">
        <h1 id={id} className="max-w-4xl text-4xl leading-[1.08] md:text-6xl">
          {title}
        </h1>
        {lede ? <p className="mt-5 max-w-2xl text-lg text-secondary-foreground md:text-xl">{lede}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
