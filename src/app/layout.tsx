import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stryde — Jobs & Leads Search",
  description: "Type what you want. Find your next role or prospect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="relative flex min-h-full flex-col bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 text-slate-900">
        <div
          className="pointer-events-none fixed inset-0 -z-10 dot-grid opacity-[0.02]"
          aria-hidden="true"
        />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
