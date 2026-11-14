import type { Metadata } from "next";
import { fontVars } from "@/lib/fonts";
import SmoothScroll from "@/components/providers/SmoothScroll";
import TopBar from "@/components/ui/TopBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aditya Nandan — Full-Stack Software Engineer",
  description:
    "Full-stack software engineer building production systems — ERP, B2B platforms and apps used daily. React, TypeScript, PostgreSQL, Cloudflare.",
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
