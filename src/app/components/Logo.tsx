import Image from "next/image";

/** The three-bodies mark from the brand pack. Symbol only: no wordmark beside it. */
export default function Logo({ height = 28 }: { height?: number }) {
  const width = Math.round((height * 276) / 100);
  return (
    <>
      <Image className="gsop-logo gsop-logo--dark" src="/brand/logos/gsop-symbol-dark.svg" alt="GSOP" width={width} height={height} priority unoptimized />
      <Image className="gsop-logo gsop-logo--light" src="/brand/logos/gsop-symbol-light.svg" alt="" aria-hidden width={width} height={height} priority unoptimized />
    </>
  );
}
