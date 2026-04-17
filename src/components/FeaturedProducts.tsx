import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getImageUrl } from "@/utils/imageUrl";

interface FeaturedProductsProps {
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image_url?: string;
    featured: boolean;
  }>;
}

const FeaturedProducts = ({ products: apiProducts }: FeaturedProductsProps) => {
  const navigate = useNavigate();

  const displayProducts = useMemo(() => {
    if (Array.isArray(apiProducts)) {
      return apiProducts
        .map(p => ({
        id: p.id,
        name: p.name,
        priceNpr: p.price,
        image: getImageUrl(p.image_url),
      }))
        .filter((p) => p.image);
    }

    return [];
  }, [apiProducts]);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section id="products" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">Curated for You</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">Featured Products</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {displayProducts.map((product, i) => (
            <div key={product.name + i} className="animate-fade-in-up cursor-pointer" style={{ animationDelay: `${i * 0.08}s` }} onClick={() => product.id ? navigate(`/product/${product.id}`) : undefined}>
              <ProductCard {...product} />
            </div>
          ))}
        </div>
        <div className="text-center mt-14">
          <button onClick={() => navigate("/shop")} className="inline-flex items-center px-10 py-3.5 border border-foreground text-foreground font-medium text-sm tracking-wide rounded-sm hover:bg-foreground hover:text-background transition-all duration-300">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
