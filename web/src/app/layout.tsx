import type { Metadata } from "next";
import { Syne, Bodoni_Moda, JetBrains_Mono, Open_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-vogue",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700", "800", "900"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kinetic.AI — Next-Gen AI Biomechanics & Edge Pose Intelligence",
  description: "Real-time AI pose detection, rep counting, and form correction powered by Next.js and MediaPipe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${bodoniModa.variable} ${openSans.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full font-sans antialiased text-white bg-black selection:bg-emerald-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
