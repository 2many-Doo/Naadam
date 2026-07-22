import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Bebas_Neue } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const vs = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-vs",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Сутай Буянт — 30 жилийн ой",
  description:
    "Сутай Буянт группын 30 жилийн ойн баяр: Бөх, Сур харваа, Хурдан морь",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className={`${display.variable} ${body.variable} ${vs.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased">
        {children}
      </body>
    </html>
  );
}
