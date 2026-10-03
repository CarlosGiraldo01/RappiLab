import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RappiLab",
  description: "Simplified delivery platform - Lab 4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
<html lang="en" className={`${fredoka.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface-muted text-ink font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}