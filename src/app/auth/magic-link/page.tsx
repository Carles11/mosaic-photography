"use client";

import { Suspense } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import MagicLinkForm from "@/components/auth/magicLinkForm";

function MagicLinkContent() {
  return (
    <div>
      <h2 className={styles.formTitle}>Magic Link Login</h2>
      <MagicLinkForm />
      <div className={styles.authLinks}>
        <p>
          <Link href="/auth/login" className={styles.authLink}>
            Use password instead
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MagicLinkContent />
    </Suspense>
  );
}
