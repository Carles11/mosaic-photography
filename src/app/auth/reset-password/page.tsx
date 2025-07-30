"use client";

import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/resetPasswordForm";
import Link from "next/link";
import styles from "../auth.module.css";

function ResetPasswordContent() {
  return (
    <div>
      <h2 className={styles.formTitle}>Set New Password</h2>
      <p className={styles.description}>
        Enter your new password below. Make sure it&apos;s at least 6 characters
        long.
      </p>
      <ResetPasswordForm redirectTo="/auth/login?message=password-updated" />
      <div className={styles.authLinks}>
        <p>
          <Link href="/auth/login" className={styles.authLink}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
