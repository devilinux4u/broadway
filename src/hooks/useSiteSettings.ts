import { useState, useEffect } from "react";
import { apiCall } from "@/services/api";

interface SiteSettings {
  store_name?: string;
  logo_url?: string;
  footer_description?: string;
  copyright_text?: string;
  location?: string;
  phone?: string;
  email?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  [key: string]: any;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall("/main");
      
      if (response.success && response.sections) {
        setSettings(response.sections.settings || {});
      }
    } catch (err) {
      console.error("Error loading site settings:", err);
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error };
};
