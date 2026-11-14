import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Marquee from "@/components/sections/Marquee";
import Works from "@/components/sections/Works";
import Approach from "@/components/sections/Approach";
import Experience from "@/components/sections/Experience";
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
      <Experience />
      <Impact />
      <Contact />
      <Footer />
    </main>
  );
}
