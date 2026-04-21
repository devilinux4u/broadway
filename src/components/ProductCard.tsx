import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const AVAILABLE_COLORS = [
  { name: "Rose", value: "#E91E63" },
  { name: "Nude", value: "#D4A574" },
  { name: "Berry", value: "#8E244D" },
  { name: "Coral", value: "#FF6F61" },
  { name: "Mauve", value: "#B784A7" },
];

interface ProductCardProps {
  name: string;
  id?: string;
  priceNpr: number;
  originalPriceNpr?: number;
  image: string;
  images?: string[];
  badge?: string;
  colors?: { name: string; value: string }[];
  description?: string;
}

const ProductCard = ({ name, id = "", priceNpr, originalPriceNpr, image, images, badge, colors, description }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const availableColors = colors && colors.length > 0 ? colors : AVAILABLE_COLORS;
  const [selectedColor, setSelectedColor] = useState(availableColors[0]);

  const allImages = images && images.length > 0 ? images : [image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to add items to cart." });
      navigate("/auth");
      return;
    }
    try {
      await addToCart({ 
        product_id: id,
        product_name: name, 
        product_image: allImages[0], 
        price_npr: priceNpr, 
        color: selectedColor.name
      });
      toast({ title: "Added to cart", description: `${name} (${selectedColor.name}) added to your cart.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add item to cart", variant: "destructive" });
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary mb-4">
        <img
          src={allImages[currentImageIndex]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {badge && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-sm">
            {badge}
          </span>
        )}

        {/* Image navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 hover:bg-card text-foreground"
              aria-label="Previous image"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 hover:bg-card text-foreground"
              aria-label="Next image"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content Container */}
      <div className="px-4 pb-4 pt-2 flex flex-col min-h-[180px] sm:min-h-[200px]">
        {/* Product Name */}
        <h3 className="font-archivo text-xs sm:text-sm md:text-[15px] font-bold text-foreground mb-2 line-clamp-2 flex-shrink-0">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-[11px] sm:text-xs text-muted-foreground mb-3 line-clamp-2 flex-shrink-0">
            {description}
          </p>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Price and Add to Cart */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm md:text-base font-semibold text-foreground">
              Rs. {priceNpr.toLocaleString()}
            </span>
            {originalPriceNpr && (
              <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground line-through">
                Rs. {originalPriceNpr.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-foreground text-background text-xs sm:text-sm font-semibold rounded-full hover:bg-foreground/90 transition-colors whitespace-nowrap w-full sm:w-auto text-center"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
