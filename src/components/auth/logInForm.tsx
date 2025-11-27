"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LogInForm.module.css";
import { supabase } from "@/lib/supabaseClient";
import { loginWithMagicLink } from "@/lib/auth/auth-helpers";

import PrimaryButton from "@/components/buttons/PrimaryButton";
import type { LoginFormProps } from "@/types";

export default function LoginForm({
  onSwitchToSignup,
  onForgotPassword,
  onEmailChange,
  initialEmail,
  onSuccess,
  redirectTo = "/",
}: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (useMagicLink) {
      // Handle magic link
      const result = await loginWithMagicLink(email);
      if (result.error) {
        setError(result.error.message);
      } else {
        setMagicLinkSent(true);
      }
    } else {
      // Handle regular login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      }
    }
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className={styles.loginFormContainer}>
        <h2 className={styles.loginFormTitle}>Magic Link Sent!</h2>
        <div className={styles.success}>
          Check your email for a magic link to sign in.
        </div>
        <div className={styles.linksRow}>
          <a
            className={styles.link}
            onClick={() => {
              setMagicLinkSent(false);
              setUseMagicLink(false);
            }}
            tabIndex={0}
            role="button"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginFormContainer}>
      <h2 className={styles.loginFormTitle}>
        {useMagicLink ? "Sign in with Magic Link" : "Login"}
      </h2>
      <form onSubmit={handleLogin} className={styles.form} autoComplete="on">
        <input
          className={styles.input}
          id="login-email"
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
            onEmailChange?.(e.target.value);
          }}
          required
        />
        {!useMagicLink && (
          <input
            className={styles.input}
            id="login-password"
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.buttonRow}>
          <PrimaryButton
            id="login-button"
            btnText={
              loading
                ? useMagicLink
                  ? "Sending magic link..."
                  : "Logging in..."
                : useMagicLink
                ? "Send Magic Link"
                : "Login"
            }
            handleClick={() => {}} // The form handles submit
            className=""
          />
        </div>
      </form>

      {/* 
        TEMPORARILY HIDE MAGIC LINK TOGGLE:
        To restore magic-link login, uncomment the block below.
      */}

      <div className={styles.linksRow}>
        <a
          className={styles.link}
          onClick={() => setUseMagicLink(!useMagicLink)}
          tabIndex={0}
          role="button"
        >
          {useMagicLink ? "Use password instead" : "Use magic link instead"}
        </a>
      </div>

      {/* Only show internal links when used in modal (when callbacks are provided) */}
      {(onSwitchToSignup || onForgotPassword) && (
        <div className={styles.linksRow}>
          {onSwitchToSignup && (
            <span>
              Don&apos;t have an account?{" "}
              <a
                className={styles.link}
                onClick={onSwitchToSignup}
                tabIndex={0}
                role="button"
              >
                Sign up
              </a>
            </span>
          )}
          {onSwitchToSignup && onForgotPassword && <br />}
          {onForgotPassword && (
            <a
              className={styles.link}
              onClick={onForgotPassword}
              tabIndex={0}
              role="button"
            >
              Forgot your password?
            </a>
          )}
        </div>
      )}
    </div>
  );
}
