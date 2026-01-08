"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ResetPasswordForm.module.css";
import { supabase } from "@/lib/supabaseClient";
import PrimaryButton from "@/components/buttons/PrimaryButton";

interface ConfirmEmailChangeFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function ConfirmEmailChangeForm({
  onSwitchToLogin,
  onSuccess,
  redirectTo = "/profile?message=email-updated",
}: ConfirmEmailChangeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get("token");
    const type = searchParams?.get("type");

    if (token && type) {
      handleEmailChangeConfirmation(token, type);
    } else {
      setError("Invalid email change confirmation link.");
      setLoading(false);
    }
  }, [searchParams]);

  type OtpType =
    | "email_change"
    | "signup"
    | "recovery"
    | "invite"
    | "magiclink";

  const handleEmailChangeConfirmation = async (token: string, type: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as OtpType,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Email change confirmed successfully!");
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(redirectTo);
          }
        }, 2000);
      }
    } catch (err) {
      setError("Email change confirmation failed. Please try again.");
      console.log("Error confirming email change:", err);
    }
    setLoading(false);
  };

  const handleContinue = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <div className={styles.confirmEmailChangeFormContainer}>
      {loading ? (
        <div>Confirming email change...</div>
      ) : (
        <>
          {error && <div className={styles.error}>{error}</div>}
          {success && (
            <>
              <div className={styles.success}>{success}</div>
              <div className={styles.buttonRow}>
                <PrimaryButton
                  id="continue-button"
                  btnText="Continue to Profile"
                  handleClick={handleContinue}
                  className=""
                />
              </div>
            </>
          )}
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
        </>
      )}
    </div>
  );
}
