"use client";

import { Suspense } from "react";
import SignupForm from "@/components/auth/signUpForm";
import Link from "next/link";
import styles from "../auth.module.css";

function SignupContent() {
  return (
    <div>
      <h2 className={styles.formTitle}>Create Account</h2>
      <SignupForm redirectTo="/auth/login?message=check-email" />
      <div className={styles.authLinks}>
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className={styles.authLink}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
