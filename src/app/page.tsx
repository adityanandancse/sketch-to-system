import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Marquee from "@/components/sections/Marquee";
import Works from "@/components/sections/Works";
import Approach from "@/components/sections/Approach";
import Flow from "@/components/sections/Flow";
import Impact from "@/components/sections/Impact";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Marquee />

      <Works />

      <Approach />
      <Flow />
      <Impact />
      <Contact />
      <Footer />
    </main>
  );
}
