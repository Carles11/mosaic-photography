"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthSession } from "./AuthSessionContext";
import { supabase } from "@/lib/supabaseClient";

type FavoritesContextType = {
  favorites: Set<string>;
  loading: boolean;
  toggleFavorite: (imageId: string | number) => Promise<void>;
  isFavorite: (imageId: string | number) => boolean;
  isUserLoggedIn: () => boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: new Set(),
  loading: true,
  toggleFavorite: async () => {},
  isFavorite: () => false,
  isUserLoggedIn: () => false,
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthSession();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load user's favorites when user changes
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites(new Set());
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("image_id")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error loading favorites:", error);
        } else if (data) {
          // Convert numeric image_id to string for consistent state management
          const favoriteIds = new Set(data.map((fav) => String(fav.image_id)));
          setFavorites(favoriteIds);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]); // Only trigger when user changes

  const toggleFavorite = async (imageId: string | number) => {
    if (!user) {
      return;
    }

    try {
      // Convert imageId to number for database operations (since image_id is int8)
      const numericImageId =
        typeof imageId === "string" ? parseInt(imageId, 10) : imageId;
      const stringImageId = String(imageId); // For local state management

      const isFavorited = favorites.has(stringImageId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("image_id", numericImageId);

        if (error) {
          console.error("Error removing favorite:", error);
        } else {
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.delete(stringImageId);
            return newFavorites;
          });
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert([{ user_id: user.id, image_id: numericImageId }]);

        if (error) {
          console.error("Error adding favorite:", error);
        } else {
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.add(stringImageId);
            return newFavorites;
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const isFavorite = (imageId: string | number) => {
    return favorites.has(String(imageId));
  };

  const isUserLoggedIn = () => {
    return !!user;
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, toggleFavorite, isFavorite, isUserLoggedIn }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
