import { ProductsHero } from "@/components/products/ProductsHero";
import { ProductList } from "@/components/products/ProductList";
import { EngineeringBreadth } from "@/components/products/EngineeringBreadth";
import { ProductsCta } from "@/components/products/ProductsCta";

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
