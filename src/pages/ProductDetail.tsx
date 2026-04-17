import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shopAPI } from "@/services/shopAPI";
import { getImageUrl } from "@/utils/imageUrl";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEFAULT_COLORS = [
  { name: "Rose", value: "#E91E63" },
  { name: "Nude", value: "#D4A574" },
  { name: "Berry", value: "#8E244D" },
  { name: "Coral", value: "#FF6F61" },
  { name: "Mauve", value: "#B784A7" },
];

const ProductDetail = () => {
  const { settings } = useSiteSettings();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [availableColors, setAvailableColors] = useState(DEFAULT_COLORS);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        // Load product details with images and colors
        const productResponse = await shopAPI.getProductByID(id);
        
        if (!productResponse.success || !productResponse.product) {
          setLoading(false);
          return;
        }

        const p = productResponse.product;
        setProduct(p);

        // Process images with full URLs
        const allImages = productResponse.images && productResponse.images.length > 0
          ? productResponse.images.map((img: string) => getImageUrl(img))
          : p.image_url ? [getImageUrl(p.image_url)] : [];
        setImages(allImages);

        // Set available colors from API
        if (productResponse.colors && productResponse.colors.length > 0) {
          const productCols = productResponse.colors;
          setAvailableColors(productCols);
          setSelectedColor(productCols[0]);
        }

        // Load related products by category
        const relatedResponse = await shopAPI.getProductsByCategory(p.category);
        if (relatedResponse.success && relatedResponse.products) {
          const related = relatedResponse.products
            .filter((prod: any) => prod.id !== id)
            .slice(0, 4);
          setRelatedProducts(related);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load product:", error);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to add items to cart." });
      navigate("/auth");
      return;
    }
    if (!product) return;
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart({
          product_id: product.id,
          product_name: product.name,
          product_image: images[0] || "",
          price_npr: product.price_npr,
          color: selectedColor.name,
        });
      }
      toast({ title: "Added to cart", description: `${quantity}x ${product.name} added to your cart.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add item to cart", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product?.name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 text-center">
          <h1 className="font-display text-2xl text-foreground mb-4">Product not found</h1>
          <Button variant="outline" onClick={() => navigate("/shop")}>Browse Products</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar settings={settings} />
      <main className="pt-20 md:pt-24">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate("/shop")} className="hover:text-primary transition-colors">Shop</button>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary">
                {images.length > 0 ? (
                  <img
                    src={images[currentImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                {product.badge && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">{product.badge}</Badge>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-all ${
                        idx === currentImage ? "border-primary" : "border-border"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm tracking-[0.2em] uppercase text-primary mb-2">{product.category}</p>
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">{product.name}</h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-foreground">Rs. {product.price_npr.toLocaleString()}</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.in_stock && product.stock_quantity > 0 ? (
                  <span className="text-sm font-medium text-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    In Stock ({product.stock_quantity} available)
                  </span>
                ) : (
                  <span className="text-sm font-medium text-destructive flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    Out of Stock
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}

              {/* Color Selection */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Color: {selectedColor.name}</p>
                <div className="flex items-center gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor.name === color.name
                          ? "border-primary scale-110 ring-2 ring-primary/30"
                          : "border-border hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Quantity</p>
                <div className="inline-flex items-center border border-border rounded-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-foreground hover:bg-secondary transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 py-2 text-foreground font-medium border-x border-border">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 text-foreground hover:bg-secondary transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="flex-1 h-12 text-sm tracking-wide gap-2"
                  size="lg"
                >
                  <ShoppingBag size={18} />
                  Add to Cart — Rs. {(product.price_npr * quantity).toLocaleString()}
                </Button>
                <Button variant="outline" size="lg" className="h-12" onClick={handleShare}>
                  <Share2 size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20 mb-10">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {relatedProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="text-left group"
                  >
                    <div className="aspect-square overflow-hidden rounded-sm bg-secondary mb-3">
                      <img
                        src={p.imageUrl ? getImageUrl(p.imageUrl) : (p.image_url ? getImageUrl(p.image_url) : "/placeholder.svg")}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-sm font-semibold text-foreground mt-1">Rs. {(p.priceNpr || p.price_npr).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings} />
      <MobileBottomNav />
    </div>
  );
};

export default ProductDetail;
