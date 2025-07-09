"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/context/AuthSessionContext";
import { supabase } from "@/lib/supabaseClient";

import ProfileForm from "@/components/profile/ProfileForm";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { user, loading } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <Header user={user} onLogoutClick={handleLogout} />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>My Profile</h1>
          <ProfileForm user={user} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
