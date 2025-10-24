"use client";

import { Suspense } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import VerifyEmailForm from "@/components/auth/verifyEmailForm";

function VerifyEmailContent() {
  return (
    <div>
      <h2 className={styles.formTitle}>Verify Email</h2>
      <VerifyEmailForm />
      <div className={styles.authLinks}>
        <p>
          <Link href="/auth/login" className={styles.authLink}>
            Continue to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
