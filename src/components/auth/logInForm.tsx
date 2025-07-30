"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./LogInForm.module.css";
import PrimaryButton from "@/components/buttons/PrimaryButton";

interface LoginFormProps {
  onSwitchToSignup?: () => void;
  onForgotPassword?: () => void;
  onEmailChange?: (email: string) => void;
  initialEmail?: string;
  onSuccess?: () => void;
  redirectTo?: string;
}

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
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
    setLoading(false);
  };

  return (
    <div className={styles.loginFormContainer}>
      <h2 className={styles.loginFormTitle}>Login</h2>
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
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.buttonRow}>
          <PrimaryButton
            id="login-button"
            btnText={loading ? "Logging in..." : "Login"}
            handleClick={() => {}} // The form handles submit
            className=""
          />
        </div>
      </form>
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
