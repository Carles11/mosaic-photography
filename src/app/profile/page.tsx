"use client";

import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/guards/ProtectedRoute";
import ProfileForm from "@/components/profile/ProfileForm";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/navigation/BottomNav/BottomNav";
import { sendGTMEvent } from "@next/third-parties/google";
import styles from "./profile.module.css";

function ProfileContent() {
  const { user, logout } = useAuth();

  const handleGoProClick = () => {
    sendGTMEvent({
      event: "goProText",
      value: "Go Pro clicked from profile bottom nav",
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
          <h1 className={styles.title}>My Profile</h1>
          <ProfileForm user={user} />
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

export default function ProfilePage() {
  return (
    <ProtectedRoute
      fallback={
        <div className={styles.loadingContainer}>
          <div className={styles.loader}>Loading...</div>
        </div>
      }
    >
      <ProfileContent />
    </ProtectedRoute>
  );
}
