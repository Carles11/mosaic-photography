"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import ContentTabs from "@/components/contents/ContentTabs";
import styles from "./photoCurations.module.css";

export default function PhotoCurationsClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>Photo Curations</h1>
          <p className={styles.subtitle}>
            Manage your favorites, collections, and comments.
          </p>
          <ContentTabs />
        </div>
      </main>
    </div>
  );
}
