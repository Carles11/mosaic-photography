"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ResetPasswordForm.module.css";
import { supabase } from "@/lib/supabaseClient";
import PrimaryButton from "@/components/buttons/PrimaryButton";

interface MagicLinkFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function MagicLinkForm({
  onSwitchToLogin,
  onSuccess,
  redirectTo = "/",
}: MagicLinkFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get("token");
    const type = searchParams?.get("type");

    if (token && type) {
      handleMagicLinkVerification(token, type);
    } else {
      setError("Invalid magic link.");
      setLoading(false);
    }
  }, [searchParams]);

  const handleMagicLinkVerification = async (token: string, type: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as "magiclink" | "recovery" | "invite" | "signup",
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(redirectTo);
          }
        }, 2000);
      }
    } catch (err) {
      setError("Magic link verification failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className={styles.magicLinkFormContainer}>
      {loading ? (
        <div>Signing you in...</div>
      ) : (
        <>
          {error && (
            <>
              <div className={styles.error}>{error}</div>
              <div className={styles.buttonRow}>
                <PrimaryButton
                  id="back-to-login-button"
                  btnText="Back to Login"
                  handleClick={() => router.push("/auth/login")}
                  className=""
                />
              </div>
            </>
          )}
          {success && <div className={styles.success}>{success}</div>}
          {onSwitchToLogin && (
            <div className={styles.linksRow}>
              <a
                className={styles.link}
                onClick={onSwitchToLogin}
                tabIndex={0}
                role="button"
              >
                Use password instead
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
