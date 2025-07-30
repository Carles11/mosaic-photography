"use client";

import { Suspense } from "react";
import ConfirmEmailForm from "@/components/auth/confirmEmailForm";
import Link from "next/link";
import styles from "../auth.module.css";

function ConfirmEmailContent() {
  return (
    <div>
      <h2 className={styles.formTitle}>Email Confirmed</h2>
      <ConfirmEmailForm />
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

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
