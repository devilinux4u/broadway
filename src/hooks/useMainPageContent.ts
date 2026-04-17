import { useState, useEffect } from "react";
import { apiCall } from "@/services/api";

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  featured: boolean;
  new_arrival?: boolean;
}

interface PageContent {
  hero?: Record<string, any>;
  categories?: Record<string, any>;
  about?: Record<string, any>;
  newsletter?: Record<string, any>;
  settings?: Record<string, any>;
}

interface UseMainPageContentReturn {
  content: PageContent;
  featuredProducts: FeaturedProduct[];
  newArrivals: FeaturedProduct[];
  loading: boolean;
  error: string | null;
  getSection: (section: string) => Record<string, any>;
  refresh: () => Promise<void>;
}

export const useMainPageContent = (): UseMainPageContentReturn => {
  const [content, setContent] = useState<PageContent>({});
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall("/main");
      
      if (response.success && response.sections) {
        setContent(response.sections);
        setFeaturedProducts(response.featured_products || []);
        setNewArrivals(response.new_arrivals || []);
      } else {
        setError("Failed to load page content");
      }
    } catch (err) {
      console.error("Error loading main page content:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setContent({});
      setFeaturedProducts([]);
      setNewArrivals([]);
    } finally {
      setLoading(false);
    }
  };

  const getSection = (section: string): Record<string, any> => {
    return content[section as keyof PageContent] || {};
  };

  return {
    content,
    featuredProducts,
    newArrivals,
    loading,
    error,
    getSection,
    refresh: loadContent,
  };
};
