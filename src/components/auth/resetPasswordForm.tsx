"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./ResetPasswordForm.module.css";
import PrimaryButton from "@/components/buttons/PrimaryButton";

interface ResetPasswordFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function ResetPasswordForm({
  onSwitchToLogin,
  onSuccess,
  redirectTo = "/auth/login?message=password-updated",
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully!");
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className={styles.resetPasswordFormContainer}>
      <h2 className={styles.resetPasswordFormTitle}>Reset Password</h2>
      <form
        onSubmit={handleResetPassword}
        className={styles.form}
        autoComplete="on"
      >
        <input
          className={styles.input}
          id="new-password"
          type="password"
          placeholder="New Password"
          value={password}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          className={styles.input}
          id="confirm-password"
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          autoComplete="new-password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <div className={styles.buttonRow}>
          <PrimaryButton
            id="reset-password-button"
            btnText={loading ? "Updating..." : "Update Password"}
            handleClick={() => {}} // The form handles submit
            className=""
          />
        </div>
      </form>
      {/* Only show internal links when used in modal (when callback is provided) */}
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
