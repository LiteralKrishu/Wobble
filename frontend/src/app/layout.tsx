import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WOBBLE — Flaky Test Investigation & Empirical Verification Platform",
  description:
    "Futuristic developer observability platform that detects, investigates, minimizes, explains, and empirically verifies flaky tests across distributed codebases.",
  keywords: [
    "flaky tests",
    "test verification",
    "developer tools",
    "observability",
    "automated reproduction",
    "delta debugging",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[#08070d] text-[#f4f4f6] font-sans selection:bg-violet-600/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
