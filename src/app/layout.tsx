import type { Metadata, Viewport } from "next";
import { fontVars } from "@/lib/fonts";
import { contact, experience, profile, site } from "@/content/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import TopBar from "@/components/ui/TopBar";
import "./globals.css";

const title = "Aditya Nandan — Full-Stack Software Engineer";
const description =
  "Full-stack engineer who builds and runs production systems end to end — ERP, B2B catalogue, mobile and commerce. 6 production apps, 150+ daily users. Open to SDE, FDE and Founder's Office roles.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s — Aditya Nandan" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Aditya Nandan",
    title,
    description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Aditya Nandan — Sketch to System",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true },
  authors: [{ name: "Aditya Nandan", url: site.url }],
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  colorScheme: "dark light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: site.url,
  email: `mailto:${contact.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Noida",
    addressCountry: "IN",
  },
  sameAs: contact.socials.map((social) => social.href),
  alumniOf: experience.education.school,
  worksFor: { "@type": "Organization", name: "Good Omen Ventures" },
  knowsAbout: [
    "TypeScript",
    "React",
    "PostgreSQL",
    "Supabase",
    "Cloudflare Workers",
    "System design",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <SmoothScroll>
          <TopBar />
          {children}
        </SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
