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
  const [categories, setCategories] = useState(CATEGORIES);
  const [images, setImages] = useState<Record<string, string[]>>({});
  const [colors, setColors] = useState<Record<string, { name: string; value: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [searchInput, setSearchInput] = useState(search);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await shopAPI.getAllProducts();
        if (response.success && response.products) {
          const uniqueCategories = new Set(response.products.map((p: any) => p.category).filter(Boolean));
          if (uniqueCategories.size > 0) {
            setCategories(["all", ...Array.from(uniqueCategories).sort() as string[]]);
          }
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

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
          
          // Extract unique categories only when loading all products
          if (category === "all" || search) {
            const uniqueCategories = new Set(response.products.map((p: any) => p.category).filter(Boolean));
            if (uniqueCategories.size > 0) {
              setCategories(["all", ...Array.from(uniqueCategories).sort() as string[]]);
            }
          }
          
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filtered.length]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIdx, startIdx + itemsPerPage);
  }, [filtered, currentPage]);

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
      <main className="pt-2 md:pt-6">
        <div className="container mx-auto px-4">

          {/* Search and Category Row */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4 md:justify-center md:max-w-4xl md:mx-auto">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 md:flex-none md:w-96">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="pl-12 pr-4 h-12 rounded-full border-border bg-card w-full text-base"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(""); setParam("q", ""); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </form>

            {/* Category Tabs */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 md:pb-0 flex-wrap">
              {categories.map((cat) => (
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
          </div>

          {/* Sort & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <p className="text-sm text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 md:hidden flex-1 sm:flex-none"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} /> Filters
            </Button>
          </div>

          <div className="flex gap-6 md:gap-8">
            {/* Sidebar Filters (desktop) */}
            <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-52 flex-shrink-0 mb-8 md:mb-0`}>
              <div className="space-y-4 md:space-y-6 sticky top-20 pb-20 md:pb-24">
                {/* Sort Filter */}
                <div className="bg-card p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Sort By</h3>
                  <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
                    <SelectTrigger className="w-full h-9 text-sm">
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

                {/* Price Filter */}
                <div className="bg-card p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Price Range</h3>
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={50}
                    value={priceRange}
                    onValueChange={(v) => setPriceRange(v as [number, number])}
                    className="mb-4"
                  />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">Min</label>
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Math.max(0, parseInt(e.target.value) || 0), priceRange[1]])}
                          className="h-8 text-sm"
                          min="0"
                          max={priceRange[1]}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">Max</label>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Math.min(maxPrice, parseInt(e.target.value) || maxPrice)])}
                          className="h-8 text-sm"
                          min={priceRange[0]}
                          max={maxPrice}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                      Rs. {priceRange[0].toLocaleString()} - Rs. {priceRange[1].toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 pb-12 md:pb-16">
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
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {paginatedProducts.map((p) => (
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
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
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
