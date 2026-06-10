import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Centrum 4fin Třebíč | Hypotéky, Investice, Pojištění",
  description:
    "Nezávislé finanční a realitní centrum v Třebíči. Hypoteční kalkulačka, srovnání sazeb 40+ bank, investiční poradenství. Konzultace zdarma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={sourceSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
