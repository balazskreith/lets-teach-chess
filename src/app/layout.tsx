"use client";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

type RootLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Tomasz Chess - Play Chess Online</title>
      </head>
      <body className={`${inter.variable} font-sans bg-background text-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
