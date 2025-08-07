import FavoritesList from "@/components/profile/FavoritesList";

interface FavoritesTabProps {
  onCollectionUpdate?: () => void;
}

const FavoritesTab = ({ onCollectionUpdate }: FavoritesTabProps) => {
  return <FavoritesList onCollectionUpdate={onCollectionUpdate} />;
};

export default FavoritesTab;
