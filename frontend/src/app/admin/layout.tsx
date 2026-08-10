import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";

export const metadata = {
  title: "Admin — Arooraa",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
