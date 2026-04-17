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
}

const ProductCard = ({ name, id = "", priceNpr, originalPriceNpr, image, images, badge, colors }: ProductCardProps) => {
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
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary mb-4">
        <img
          src={allImages[currentImageIndex]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Image navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-card text-foreground"
              aria-label="Previous image"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-card text-foreground"
              aria-label="Next image"
            >
              <ChevronRight size={14} />
            </button>
            {/* Dots */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? "bg-primary w-3" : "bg-card/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
        {badge && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-sm">
            {badge}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-foreground text-background text-sm font-medium tracking-wide rounded-sm hover:bg-foreground/90 transition-colors"
          >
            Add to Cart — {selectedColor.name}
          </button>
        </div>
      </div>
      <h3 className="font-medium text-sm text-foreground mb-1 group-hover:text-primary transition-colors">{name}</h3>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-foreground">Rs. {priceNpr.toLocaleString()}</span>
        {originalPriceNpr && (
          <span className="text-xs text-muted-foreground line-through">Rs. {originalPriceNpr.toLocaleString()}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {availableColors.map((color) => (
          <button
            key={color.name}
            onClick={() => setSelectedColor(color)}
            title={color.name}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              selectedColor.name === color.name
                ? "border-primary scale-110 ring-1 ring-primary/30"
                : "border-border hover:border-muted-foreground"
            }`}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCard;
