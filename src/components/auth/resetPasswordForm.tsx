"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ResetPasswordForm.module.css";
import { supabase } from "@/lib/supabaseClient";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { parseHashParams } from "@/helpers/parseHashParams";

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

  const [tokenChecked, setTokenChecked] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    function extractTokenType() {
      let token = searchParams?.get("token");
      let type = searchParams?.get("type");

      if (typeof window !== "undefined") {
        const hashParams = parseHashParams(window.location.hash);
        if (hashParams.access_token) token = hashParams.access_token;
        if (hashParams.token) token = hashParams.token; // sometimes used
        if (hashParams.type) type = hashParams.type;
      }

      return { token, type };
    }

    // Wait for searchParams and hash to be non-empty before attempting verification
    const { token, type } = extractTokenType();

    if (token && type) {
      handleTokenVerification(token, type);
      setTokenChecked(true);
    } else {
      // Instead of showing an error immediately, just mark as checked.
      setTokenChecked(true);
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
      } else {
        setError(null); // clear error if valid
      }
    } catch (err) {
      setError("Token verification failed.");
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
      {/* Only show error if we've actually checked for token presence */}
      {tokenChecked && error && !success && (
        <div className={styles.error}>{error}</div>
      )}
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
