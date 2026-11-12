import {
  Anton,
  Cormorant_Garamond,
  Mrs_Saint_Delafield,
  Jost,
  JetBrains_Mono,
} from "next/font/google";

export const display = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const serif = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const script = Mrs_Saint_Delafield({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-script",
});

export const sans = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const fontVars = [display, serif, script, sans, mono]
  .map((font) => font.variable)
  .join(" ");
