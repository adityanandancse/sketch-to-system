import Hero from "@/components/sections/Hero";

export default function Home() {
  return (
    <main>
      <Hero />

      <section id="about" className="min-h-[150vh] bg-ink px-10 py-32 text-paper">
        <p className="font-mono text-xs">02 / ABOUT</p>
        <p className="mt-6 font-serif text-4xl">About — coming next.</p>
      </section>
    </main>
  );
}
