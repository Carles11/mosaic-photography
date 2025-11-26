"use client";
import { useState } from "react";
import styles from "./ForgotPasswordForm.module.css";
// Import your helper:
import { sendPasswordResetEmail } from "@/lib/auth/auth-helpers";

interface ForgotPasswordFormProps {
  onSwitchToLogin?: () => void;
  initialEmail?: string;
}

export default function ForgotPasswordForm({
  onSwitchToLogin,
  initialEmail,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await sendPasswordResetEmail(email);

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess("Check your email for a password reset link!");
    }
    setLoading(false);
  };

  return (
    <div className={styles.forgotPasswordFormContainer}>
      <h2 className={styles.forgotPasswordFormTitle}>Forgot Password</h2>
      <form onSubmit={handleForgot} className={styles.form} autoComplete="on">
        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <div className={styles.buttonRow}>
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </form>
      {onSwitchToLogin && (
        <div className={styles.linksRow}>
          <a
            className={styles.link}
            onClick={onSwitchToLogin}
            tabIndex={0}
            role="button"
          >
            Back to login
          </a>
        </div>
      )}
    </div>
  );
}
