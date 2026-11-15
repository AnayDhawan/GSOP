import Image from "next/image";
import type { ReactNode } from "react";

/* A captioned picture. The files are local and already sized, so the optimiser is skipped. */
export default function PagePhoto({ src, alt, width, height, caption, className = "", dark = false }: { src: string; alt: string; width: number; height: number; caption?: ReactNode; className?: string; dark?: boolean }) {
  return (
    <figure className={className}>
      <Image src={src} alt={alt} width={width} height={height} unoptimized loading="lazy" className={`h-auto w-full border border-border ${dark ? "bg-black" : ""}`} />
      {caption ? <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}
