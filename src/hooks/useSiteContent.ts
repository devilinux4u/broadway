import { useState, useEffect } from "react";
import { apiCall } from "@/services/api";

interface SiteContent {
  [section: string]: Record<string, any>;
}

export const useSiteContent = () => {
  const [content, setContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await apiCall("/main");
      const mapped: SiteContent = {};
      if (response?.sections && typeof response.sections === "object") {
        Object.entries(response.sections).forEach(([section, sectionContent]) => {
          mapped[section] = (sectionContent || {}) as Record<string, any>;
        });
      }
      setContent(mapped);
    } catch (error) {
      console.error("Failed to load site content:", error);
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  const getSection = (section: string) => content[section] || {};

  return { content, loading, getSection, refresh: loadContent };
};
