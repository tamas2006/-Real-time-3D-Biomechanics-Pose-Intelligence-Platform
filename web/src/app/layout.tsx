import type { Metadata } from "next";
import { Outfit, Instrument_Serif, JetBrains_Mono, Open_Sans, Bodoni_Moda } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-vogue",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
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
      className={`${outfit.variable} ${bodoniModa.variable} ${openSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full font-sans antialiased text-white bg-black selection:bg-emerald-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
