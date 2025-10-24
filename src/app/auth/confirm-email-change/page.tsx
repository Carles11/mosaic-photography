"use client";

import { Suspense } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import ConfirmEmailChangeForm from "@/components/auth/confirmEmailChangeForm";

function ConfirmEmailChangeContent() {
  return (
    <div>
      <h2 className={styles.formTitle}>Confirm Email Change</h2>
      <ConfirmEmailChangeForm />
      <div className={styles.authLinks}>
        <p>
          <Link href="/profile" className={styles.authLink}>
            Back to profile
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmEmailChangePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmEmailChangeContent />
    </Suspense>
  );
}
