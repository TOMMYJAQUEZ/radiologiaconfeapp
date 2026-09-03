import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Radiología con Fe — Plataforma Educativa de Radiología",
  description: "Plataforma educativa para aprender y evaluar conocimientos de Radiología, Anatomía, Física Radiológica, Rayos X, Tomografía y más.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
