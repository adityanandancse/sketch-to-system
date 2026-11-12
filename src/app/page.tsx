import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Marquee from "@/components/sections/Marquee";
import Works from "@/components/sections/Works";
import Approach from "@/components/sections/Approach";
import Flow from "@/components/sections/Flow";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Marquee />

      <Works />

      <Approach />
      <Flow />

      <section id="impact" className="min-h-screen bg-paper text-ink px-10 py-32">
        <p className="font-mono text-xs">06 / IMPACT — coming next</p>
      </section>
    </main>
  );
}
