"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SignUpForm.module.css";
import { supabase } from "@/lib/supabaseClient";
import PrimaryButton from "@/components/buttons/PrimaryButton";

interface SignupFormProps {
  onSwitchToLogin?: () => void;
  initialEmail?: string;
  onEmailChange?: (email: string) => void;
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function SignupForm({
  onSwitchToLogin,
  initialEmail,
  onEmailChange,
  onSuccess,
  redirectTo = "/auth/login?message=check-email",
}: SignupFormProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Check your email for a confirmation link!");
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to login with success message after 2 seconds
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.signupFormContainer}>
      <h2 className={styles.signupFormTitle}>Sign Up</h2>
      <form onSubmit={handleSignup} className={styles.form} autoComplete="on">
        <input
          className={styles.input}
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
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <div className={styles.buttonRow}>
          <PrimaryButton
            id="signup-button"
            btnText={loading ? "Signing up..." : "Sign Up"}
            handleClick={() => {}}
            className=""
          />
        </div>
      </form>
      {/* Only show internal links when used in modal (when callback is provided) */}
      {onSwitchToLogin && (
        <div className={styles.linksRow}>
          <span>
            Already have an account?{" "}
            <a
              className={styles.link}
              onClick={onSwitchToLogin}
              tabIndex={0}
              role="button"
            >
              Log in
            </a>
          </span>
        </div>
      )}
    </div>
  );
}
