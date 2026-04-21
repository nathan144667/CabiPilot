import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "CabiPilot — Le copilote IA dédié aux cabinets sur Pennylane",
  description:
    "CabiPilot est le copilote IA spécialement conçu pour les cabinets d'expertise comptable qui utilisent Pennylane. Relances clients automatisées, Q&A dossier avec citations, 10h/semaine récupérées par collab, zéro migration.",
  metadataBase: new URL("https://cabipilot.fr"),
  openGraph: {
    title: "CabiPilot — Le copilote IA pour cabinets sur Pennylane",
    description:
      "Récupérez 10h par semaine par collaborateur. Relances IA, Q&A sur dossier, dédié Pennylane, sans migration.",
    url: "https://cabipilot.fr",
    siteName: "CabiPilot",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
