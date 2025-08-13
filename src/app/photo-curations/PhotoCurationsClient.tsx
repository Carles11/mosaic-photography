"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/navigation/BottomNav/BottomNav";
import ContentTabs from "@/components/contents/ContentTabs";
import styles from "./photoCurations.module.css";

export default function PhotoCurationsClient() {
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
    router.push("/auth/login?redirect=/photo-curations");
    return null;
  }

  return (
    <div className={styles.container}>
      <Header user={user} onLogoutClick={logout} />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>Photo Curations</h1>
          <p className={styles.subtitle}>
            Manage your favorites, collections, and comments.
          </p>
          <ContentTabs />
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
