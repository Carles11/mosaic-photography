import { forwardRef } from "react";
import CollectionsList, {
  type CollectionsListRef,
} from "@/components/profile/CollectionsList";

const CollectionsTab = forwardRef<CollectionsListRef>((props, ref) => {
  return <CollectionsList ref={ref} />;
});

CollectionsTab.displayName = "CollectionsTab";

export default CollectionsTab;
