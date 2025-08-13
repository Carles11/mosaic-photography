import type { Metadata } from "next";
import { Suspense } from "react";
import styles from "./auth.module.css";

export const metadata: Metadata = {
  title: "Authentication | Mosaic Photography",
  description:
    "Sign in or create an account to access your profile, save favorites, and manage your collections on Mosaic Photography.",
  robots: {
    index: false, // Don't index auth pages
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authWrapper}>
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>Mosaic</h1>
          <p className={styles.tagline}>Public domain photography gallery</p>
        </div>
        <div className={styles.formSection}>
          <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
