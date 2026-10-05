import type { Metadata } from "next";
import { Bodoni_Moda, Inter, Italiana } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

// Display serif. Bodoni Moda's optical-size axis gives the hairline,
// high-contrast didone look at huge sizes.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
});

// Alternative display face; only downloaded if `--font-display` points at it.
const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  weight: "400",
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Date Night",
  description: "A date-night itinerary, one stop at a time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${italiana.variable} ${inter.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
