import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cupid AI — Admin Dashboard",
  description: "CEO dashboard for Cupid AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        suppressHydrationWarning
        style={{ backgroundColor: "#030712", color: "#f9fafb", minHeight: "100vh" }}
      >
        {children}
      </body>
    </html>
  );
}
