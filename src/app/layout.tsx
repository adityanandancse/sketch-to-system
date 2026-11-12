import type { Metadata } from "next";
import { fontVars } from "@/lib/fonts";
import SmoothScroll from "@/components/providers/SmoothScroll";
import TopBar from "@/components/ui/TopBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aditya Nandan — Sketch to System",
  description:
    "Designer and full-stack engineer building systems, apps and brands from first sketch to production.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <SmoothScroll>
          <TopBar />
          {children}
        </SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
