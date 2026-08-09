import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { DemoModalProvider } from "@/components/demo-request/DemoModalContext";
import { DemoRequestModal } from "@/components/demo-request/DemoRequestModal";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arooraa — AI-first Software Products",
  description:
    "Arooraa builds intelligent platforms for restaurants and modern businesses. Our flagship product, MESA, simplifies ordering, kitchen workflows, billing, and AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body>
        <DemoModalProvider>
          <Nav />
          {children}
          <Footer />
          <DemoRequestModal />
        </DemoModalProvider>
      </body>
    </html>
  );
}
