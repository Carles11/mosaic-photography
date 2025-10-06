import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { GalleryFilter } from "@/types"; // Adjust path if needed
import { useAuth } from "@/hooks/useAuth"; // Adjust path if needed
import { supabase } from "@/lib/supabaseClient"; // Adjust path if needed

type FiltersContextType = {
  filters: GalleryFilter;
  setFilters: (filters: GalleryFilter) => Promise<void>;
  clearFilters: () => Promise<void>;
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const useFilters = () => {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("FiltersContext missing");
  return ctx;
};

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFiltersState] = useState<GalleryFilter>({});
  const { user } = useAuth();

  // Load filters from DB for logged-in users
  useEffect(() => {
    async function loadUserFilters() {
      if (user?.id) {
        const { data } = await supabase
          .from("user_profiles")
          .select("filters")
          .eq("id", user.id)
          .single();
        if (data?.filters) setFiltersState(data.filters);
      }
    }
    loadUserFilters();
  }, [user?.id]);

  const setFilters = async (newFilters: GalleryFilter) => {
    setFiltersState(newFilters);
    if (user?.id) {
      await supabase
        .from("user_profiles")
        .update({ filters: newFilters })
        .eq("id", user.id);
    }
  };

  const clearFilters = async () => {
    setFiltersState({});
    if (user?.id) {
      await supabase
        .from("user_profiles")
        .update({ filters: {} })
        .eq("id", user.id);
    }
  };

  return (
    <FiltersContext.Provider value={{ filters, setFilters, clearFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};
