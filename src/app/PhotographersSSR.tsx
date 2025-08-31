import { Photographer } from "@/types/gallery";
import PhotographersViewCard from "@/components/cards/PhotographersViewCard";

interface PhotographersSSRProps {
  photographers: Photographer[];
  onLoginRequired?: () => void;
}

export default function PhotographersSSR({
  photographers,
  onLoginRequired,
}: PhotographersSSRProps) {
  return (
    <PhotographersViewCard
      photographers={photographers}
      onLoginRequired={onLoginRequired}
    />
  );
}
