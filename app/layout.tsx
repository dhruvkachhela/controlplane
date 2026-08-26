import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import PaperTexture from "@/components/PaperTexture";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ControlPlane.ai | Zero-Trust Control Plane for AI Agents",
  description: "The enterprise zero-trust guardrail pipeline for autonomous AI agents. Deterministic PII tokenization, prompt injection firewall, NVIDIA NIM Llama 3.1 8B inference, and critic verification.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      <body className="bg-[#0A0A0A] text-[#F4F4F5] antialiased selection:bg-[#FF5500] selection:text-white relative">
        {/* Live Interactive Textured Paper Stock & Tuner */}
        <PaperTexture />

        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
