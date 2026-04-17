import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { shopAPI } from "@/services/shopAPI";
import { getImageUrl } from "@/utils/imageUrl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import ProductCard from "@/components/ProductCard";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = ["all", "face", "eyes", "lips", "nails", "tools"];

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSiteSettings();
  const [products, setProducts] = useState<any[]>([]);
  const [images, setImages] = useState<Record<string, string[]>>({});
  const [colors, setColors] = useState<Record<string, { name: string; value: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const load = async () => {
      try {
        let response;
        
        // Load products based on current filters
        if (search) {
          response = await shopAPI.searchProducts(search);
        } else if (category !== "all") {
          response = await shopAPI.getProductsByCategory(category);
        } else {
          response = await shopAPI.getAllProducts();
        }

        if (response.success && response.products) {
          setProducts(response.products);
          
          // Process images and colors from API response
          const imageMap: Record<string, string[]> = {};
          const colorMap: Record<string, { name: string; value: string }[]> = {};

          if (response.images) {
            for (const [productId, imageUrls] of Object.entries(response.images)) {
              imageMap[productId] = (imageUrls as string[]).map(url => getImageUrl(url));
            }
          }

          if (response.colors) {
            for (const [productId, colorsList] of Object.entries(response.colors)) {
              colorMap[productId] = colorsList as { name: string; value: string }[];
            }
          }

          setImages(imageMap);
          setColors(colorMap);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search, category]);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 10000;
    return Math.max(...products.map((p) => p.priceNpr || p.price_npr || 10000));
  }, [products]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const filtered = useMemo(() => {
    let result = [...products];
    // Filter by price range
    result = result.filter((p) => {
      const price = p.priceNpr || p.price_npr;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Sort results
    switch (sort) {
      case "price-low": result.sort((a, b) => (a.priceNpr || a.price_npr) - (b.priceNpr || b.price_npr)); break;
      case "price-high": result.sort((a, b) => (b.priceNpr || b.price_npr) - (a.priceNpr || a.price_npr)); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [products, sort, priceRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("q", searchInput); else params.delete("q");
    setSearchParams(params);
  };

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "newest") params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar settings={settings} />
      <main className="pt-20 md:pt-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">Browse</p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground">Our Products</h1>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="pl-11 pr-4 h-12 rounded-full border-border bg-card"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(""); setParam("q", ""); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setParam("category", cat)}
                className={`px-4 py-2 text-sm font-medium rounded-full capitalize transition-colors whitespace-nowrap ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Sort & Filter Bar */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={14} /> Filters
              </Button>
              <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low → High</SelectItem>
                  <SelectItem value="price-high">Price: High → Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters (desktop) */}
            <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 flex-shrink-0 space-y-6 mb-8 md:mb-0`}>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Price Range</h3>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={50}
                  value={priceRange}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rs. {priceRange[0]}</span>
                  <span>Rs. {priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-secondary rounded-sm mb-3" />
                      <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                      <div className="h-4 bg-secondary rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">No products found</p>
                  <Button variant="outline" onClick={() => { setSearchInput(""); setSearchParams(new URLSearchParams()); }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filtered.map((p) => (
                    <div
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      <ProductCard
                        name={p.name}
                        priceNpr={p.priceNpr || p.price_npr}
                        image={p.imageUrl ? getImageUrl(p.imageUrl) : (p.image_url ? getImageUrl(p.image_url) : "/placeholder.svg")}
                        images={images[p.id] || (p.image_url ? [getImageUrl(p.image_url)] : [])}
                        badge={p.badge || undefined}
                        colors={colors[p.id]}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
      <MobileBottomNav />
    </div>
  );
};

export default Shop;
