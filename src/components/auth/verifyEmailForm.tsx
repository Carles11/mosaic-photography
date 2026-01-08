"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ResetPasswordForm.module.css";
import { supabase } from "@/lib/supabaseClient";
import PrimaryButton from "@/components/buttons/PrimaryButton";

interface VerifyEmailFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function VerifyEmailForm({
  onSwitchToLogin,
  onSuccess,
  redirectTo = "/auth/login?message=email-verified",
}: VerifyEmailFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get("token");
    const type = searchParams?.get("type");

    if (token && type) {
      handleEmailVerification(token, type);
    } else {
      setError("Invalid verification link.");
      setLoading(false);
    }
  }, [searchParams]);

  type OtpType =
    | "signup"
    | "invite"
    | "magiclink"
    | "recovery"
    | "email_change";

  const handleEmailVerification = async (token: string, type: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as OtpType,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Email verified successfully!");
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(redirectTo);
          }
        }, 2000);
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      console.log("Error verifying email:", err);
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
    <div className={styles.verifyEmailFormContainer}>
      {loading ? (
        <div>Verifying your email...</div>
      ) : (
        <>
          {error && <div className={styles.error}>{error}</div>}
          {success && (
            <>
              <div className={styles.success}>{success}</div>
              <div className={styles.buttonRow}>
                <PrimaryButton
                  id="continue-button"
                  btnText="Continue to Login"
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
