"use client";

import { useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SupabaseUser } from "@/lib/supabaseClient";
import FavoritesTab from "./FavoritesTab";
import CollectionsTab from "./CollectionsTab";
import CommentsTab from "./CommentsTab";
import styles from "./ContentTabs.module.css";

interface ContentTabsProps {
  user: SupabaseUser;
}

type TabType = "favorites" | "collections" | "comments";

const ContentTabs = ({ user }: ContentTabsProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams?.get("tab") as TabType) || "favorites";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const collectionsRef = useRef<{ refreshCollections: () => void } | null>(
    null,
  );

  const handleTabChange = (tab: TabType) => {
    console.log("🔍 [DEBUG] Tab changed to:", tab);
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.pathname + url.search);
  };

  const handleCollectionRefresh = () => {
    console.log("🔍 [DEBUG] Collection refresh requested");
    collectionsRef.current?.refreshCollections();
  };

  return (
    <div className={styles.tabsContainer}>
      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === "favorites" ? styles.active : ""}`}
          onClick={() => handleTabChange("favorites")}
        >
          <span className={styles.tabIcon}>♡</span>
          <span className={styles.tabLabel}>Favorites</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "collections" ? styles.active : ""}`}
          onClick={() => handleTabChange("collections")}
        >
          <span className={styles.tabIcon}>📚</span>
          <span className={styles.tabLabel}>Collections</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "comments" ? styles.active : ""}`}
          onClick={() => handleTabChange("comments")}
        >
          <span className={styles.tabIcon}>💬</span>
          <span className={styles.tabLabel}>Comments</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "favorites" && (
          <FavoritesTab onCollectionUpdate={handleCollectionRefresh} />
        )}
        {activeTab === "collections" && (
          <>
            {console.log("🔍 [DEBUG] Rendering CollectionsTab")}
            <CollectionsTab ref={collectionsRef} />
          </>
        )}
        {activeTab === "comments" && <CommentsTab />}
      </div>
    </div>
  );
};

export default ContentTabs;
