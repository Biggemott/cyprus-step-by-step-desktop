import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyprus Step-by-Step",
  description: "A practical guide to Cyprus admin tasks.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
