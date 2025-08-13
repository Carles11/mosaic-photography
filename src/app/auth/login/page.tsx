"use client";

import { Suspense } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import LoginForm from "@/components/auth/logInForm";

function LoginContent() {
  return (
    <div>
      <h2 className={styles.formTitle}>Welcome Back</h2>
      <LoginForm redirectTo="/" />
      <div className={styles.authLinks}>
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className={styles.authLink}>
            Sign up
          </Link>
        </p>
        <p>
          <Link href="/auth/forgot-password" className={styles.authLink}>
            Forgot your password?
          </Link>
        </p>
        <p>
          <Link href="/" className={styles.authLink}>
            Or continue to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
