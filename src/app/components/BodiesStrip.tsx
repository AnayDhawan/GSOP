/* The three bodies on a plain strip, in the composition of the OG image: Moon, Earth, Mars, equal size, even gaps.
   Static on purpose. Nothing else goes in this strip. */
const BODIES = [
  { name: "Moon", src: "/img/bodies/moon.jpg" },
  { name: "Earth", src: "/img/bodies/earth.jpg" },
  { name: "Mars", src: "/img/bodies/mars.jpg" },
] as const;

export default function BodiesStrip() {
  return (
    <div data-testid="bodies-strip" className="w-full bg-background">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-[4.6%] px-6 py-10">
        {BODIES.map((b) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={b.name} src={b.src} alt={b.name} width={600} height={600} loading="lazy" decoding="async" className="aspect-square w-[28%] rounded-full object-cover" />
        ))}
      </div>
    </div>
  );
}
