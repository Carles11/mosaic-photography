"use client";

import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Link from "next/link";
import styles from "../auth.module.css";

function ForgotPasswordContent() {
  return (
    <div>
      <h2 className={styles.formTitle}>Reset Password</h2>
      <p className={styles.description}>
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>
      <ForgotPasswordForm />
      <div className={styles.authLinks}>
        <p>
          Remember your password?{" "}
          <Link href="/auth/login" className={styles.authLink}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
