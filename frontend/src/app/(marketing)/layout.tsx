import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { DemoModalProvider } from "@/components/demo-request/DemoModalContext";
import { DemoRequestModal } from "@/components/demo-request/DemoRequestModal";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DemoModalProvider>
      <Nav />
      {children}
      <Footer />
      <DemoRequestModal />
    </DemoModalProvider>
  );
}
