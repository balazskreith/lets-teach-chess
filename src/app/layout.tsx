"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import IntlProvider from "../providers/IntlProvider";

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
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={`${inter.variable} font-sans bg-background text-foreground min-h-screen`}>
        <IntlProvider>{children}</IntlProvider>
      </body>
    </html>
  );
}
