"use client";

import { Suspense } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import styles from "./contents.module.css";
import { useAuth } from "@/hooks/useAuth";
// import { ProtectedRoute } from "@/components/auth/guards/ProtectedRoute";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/navigation/BottomNav/BottomNav";
import ContentTabs from "@/components/contents/ContentTabs";

function MyContentContent() {
  const { user, logout } = useAuth();

  const handleGoProClick = () => {
    sendGTMEvent({
      event: "goProText",
      value: "Go Pro clicked from my content bottom nav",
    });
  };

  if (!user) {
    return null; // ProtectedRoute will handle redirect
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
  // <ProtectedRoute
  //   fallback={
  //     <div className={styles.loadingContainer}>
  //       <div className={styles.loader}>Loading...</div>
  //     </div>
  //   }
  // >
  //   <MyContentContent />;{" "}
  // </ProtectedRoute>;
  return <MyContentContent />;
}
