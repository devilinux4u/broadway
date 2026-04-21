import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getImageUrl } from "@/utils/imageUrl";

interface NewArrivalsProps {
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image_url?: string;
    new_arrival?: boolean;
  }>;
}

const NewArrivals = ({ products: apiProducts }: NewArrivalsProps) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const maxPosition = clientWidth - cardWidth;
      const position = maxScroll > 0 ? (scrollLeft / maxScroll) * maxPosition : 0;
      setSliderPosition(Math.max(0, position));
    }
  };

  const updateCardWidth = () => {
    if (scrollContainerRef.current) {
      const firstChild = scrollContainerRef.current.firstChild as HTMLElement;
      if (firstChild) {
        setCardWidth(firstChild.offsetWidth);
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    }
  };

  const displayProducts = useMemo(() => {
    if (Array.isArray(apiProducts)) {
      return apiProducts
        .map((p) => ({
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

  const isScrollable = displayProducts.length > 4;

  return (
    <section id="new-arrivals" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-primary mb-2 sm:mb-3">Just Dropped</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">New Arrivals</h2>
        </div>
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onLoad={updateCardWidth}
            onMouseEnter={updateCardWidth}
            className={
              isScrollable
                ? "flex overflow-x-auto hide-scrollbar gap-4 md:gap-8"
                : "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
            }
          >
          {displayProducts.map((product, i) => (
            <div
              key={product.name + i}
              className={`animate-fade-in-up cursor-pointer ${isScrollable ? "shrink-0 w-[calc(50%-0.5rem)] md:w-[calc(25%-1.5rem)]" : ""}`}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => (product.id ? navigate(`/product/${product.id}`) : undefined)}
            >
              <ProductCard {...product} />
            </div>
          ))}
          </div>          {isScrollable && (
            <div className="mt-4 h-1 bg-foreground/10 rounded-full overflow-visible">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ 
                  width: `${cardWidth}px`,
                  transform: `translateX(${sliderPosition}px)`
                }}
              />
            </div>
          )}        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
