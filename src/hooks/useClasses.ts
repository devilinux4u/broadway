import { useState, useEffect } from "react";
import { getClasses, type ClassItem } from "@/services/classesAPI";

export const useClasses = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      try {
        const fetchedClasses = await getClasses();
        setClasses(fetchedClasses);
        setError(null);
      } catch (err) {
        console.error("Failed to load classes:", err);
        setError(err instanceof Error ? err.message : "Failed to load classes");
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  return { classes, loading, error };
};
