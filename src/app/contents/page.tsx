"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";
import styles from "./contents.module.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/navigation/BottomNav/BottomNav";
import ContentTabs from "@/components/contents/ContentTabs";

function MyContentContent() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleGoProClick = () => {
    sendGTMEvent({
      event: "goProText",
      value: "Go Pro clicked from my content bottom nav",
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login?redirect=/contents");
    return null;
  }

  return (
    <div className={styles.container}>
      <Header user={user} onLogoutClick={logout} />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>My Content</h1>
          <p className={styles.subtitle}>
            Manage your favorites, collections, and comments.
          </p>
          <Suspense fallback={<div>Loading content...</div>}>
            <ContentTabs />
          </Suspense>
        </div>
      </main>
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        user={user}
        onLogoutClick={logout}
        onGoProClick={handleGoProClick}
      />
    </div>
  );
}

export default function MyContentPage() {
  return <MyContentContent />;
}
