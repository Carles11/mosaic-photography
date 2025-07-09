"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthSession } from "./AuthSessionContext";

type FavoritesContextType = {
  favorites: Set<string>;
  loading: boolean;
  toggleFavorite: (imageId: string) => Promise<void>;
  isFavorite: (imageId: string) => boolean;
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
          const favoriteIds = new Set(data.map((fav) => fav.image_id));
          setFavorites(favoriteIds);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user?.id]); // Only trigger when user ID changes

  const toggleFavorite = async (imageId: string) => {
    if (!user) {
      console.log("User must be logged in to favorite images");
      return;
    }

    try {
      const isFavorited = favorites.has(imageId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("image_id", imageId);

        if (error) {
          console.error("Error removing favorite:", error);
        } else {
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.delete(imageId);
            return newFavorites;
          });
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert([{ user_id: user.id, image_id: imageId }]);

        if (error) {
          console.error("Error adding favorite:", error);
        } else {
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.add(imageId);
            return newFavorites;
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const isFavorite = (imageId: string) => {
    return favorites.has(imageId);
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
