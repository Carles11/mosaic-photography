"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ResetPasswordForm.module.css";
import { supabase } from "@/lib/supabaseClient";
import PrimaryButton from "@/components/buttons/PrimaryButton";

interface PasswordResetFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function PasswordResetForm({
  onSwitchToLogin,
  onSuccess,
  redirectTo = "/auth/login?message=password-reset-complete",
}: PasswordResetFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get("token");
    const type = searchParams?.get("type");

    if (token && type) {
      // Verify the token first
      handleTokenVerification(token, type);
    } else {
      setError("Invalid or missing password reset token.");
      setInitializing(false);
    }
  }, [searchParams]);

  const handleTokenVerification = async (token: string, type: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as "recovery" | "email",
      });

      if (error) {
        setError("Invalid or expired reset token.");
      }
    } catch (err) {
      setError("Token verification failed.");
      console.log("Error verifying token:", err);
    }
    setInitializing(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
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

  if (initializing) {
    return (
      <div className={styles.resetPasswordFormContainer}>
        Verifying reset token...
      </div>
    );
  }

  return (
    <div className={styles.resetPasswordFormContainer}>
      <form
        onSubmit={handlePasswordReset}
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
          minLength={8}
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
          minLength={8}
        />
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <div className={styles.buttonRow}>
          <PrimaryButton
            id="reset-password-button"
            btnText={loading ? "Updating..." : "Update Password"}
            handleClick={() => {}}
            className=""
          />
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
