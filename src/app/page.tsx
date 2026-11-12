import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Marquee from "@/components/sections/Marquee";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Marquee />

      <section id="works" className="min-h-screen bg-paper text-ink px-10 py-32">
        <p className="font-mono text-xs">03 / WORKS — coming next</p>
      </section>
    </main>
  );
}
