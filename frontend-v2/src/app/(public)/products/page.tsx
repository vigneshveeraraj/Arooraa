import type { Metadata } from "next";
import { ProductsHero } from "@/components/products/ProductsHero";
import { ProductList } from "@/components/products/ProductList";
import { EngineeringBreadth } from "@/components/products/EngineeringBreadth";
import { ProductsCta } from "@/components/products/ProductsCta";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Products — MESA, Mindra & Connected Products | AROORAA",
  description:
    "AROORAA's own products, built with the same engineering discipline as its client work — MESA connected restaurant technology, Mindra personal and family second brain, and connected physical products in development.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <main>
      <ProductsHero />
      <ProductList />
      <EngineeringBreadth />
      <ProductsCta />
    </main>
  );
}
