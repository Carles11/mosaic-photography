"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Adjust import path if needed:
import { parseHashParams } from "@/helpers/parseHashParams";
import styles from "./ResetPasswordForm.module.css";
import { supabase } from "@/lib/supabaseClient";
import PrimaryButton from "@/components/buttons/PrimaryButton";

interface MagicLinkFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  redirectTo?: string;
}

function getStoredEmail(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("magic_link_email");
  }
  return null;
}

function clearStoredEmail() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("magic_link_email");
  }
}

// --- UPDATED HOOK ---
export default function MagicLinkForm({
  onSwitchToLogin,
  onSuccess,
  redirectTo = "/dashboard",
}: MagicLinkFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract token/type from hash or query
  function getAuthParams() {
    // Query params:
    const queryToken = searchParams?.get("token");
    const queryType = searchParams?.get("type");

    // Hash params:
    let hashToken = "";
    let hashType = "";
    let hashParams: Record<string, string> = {};
    if (typeof window !== "undefined") {
      hashParams = parseHashParams(window.location.hash);
      if (hashParams.access_token) hashToken = hashParams.access_token;
      if (hashParams.token) hashToken = hashParams.token;
      if (hashParams.type) hashType = hashParams.type;
    }

    // Prefer hash values if present, else fall back to query
    return {
      token: hashToken || queryToken || "",
      type: hashType || queryType || "",
    };
  }

  useEffect(() => {
    const storedEmail = getStoredEmail();
    if (storedEmail) {
      setEmail(storedEmail);
      setShowEmailPrompt(false);
    } else {
      setShowEmailPrompt(true);
    }
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.trim());
  };

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      localStorage.setItem("magic_link_email", email); // Cache email
      setShowEmailPrompt(false);
      verifyMagicLink();
    } else {
      setError("Email required to verify magic link");
    }
  };

  const verifyMagicLink = async () => {
    setLoading(true);
    setError(null);

    const { token, type } = getAuthParams();

    // --- DEBUG ---
    console.log("MagicLinkForm verifying with", { email, token, type });

    if (!token || !type || !email) {
      setError("Invalid magic link or missing email.");
      setLoading(false);
      return;
    }
    try {
      const { error: supabaseError } = await supabase.auth.verifyOtp({
        email,
        token_hash: token,
        type: type as "magiclink" | "recovery" | "invite" | "signup",
      });
      if (supabaseError) {
        setError(supabaseError.message || "Magic link verification failed.");
      } else {
        setSuccess("Login successful! Redirecting...");
        clearStoredEmail();
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.push(redirectTo);
        }, 2000);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Magic link verification failed. Please try again."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    const { token, type } = getAuthParams();
    // Automatically verify if we have all values and no prompt
    if (!showEmailPrompt && email && token && type) {
      verifyMagicLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmailPrompt, email, searchParams]);

  return (
    <div className={styles.magicLinkFormContainer}>
      {loading ? (
        <div>Signing you in...</div>
      ) : (
        <>
          {showEmailPrompt && (
            <form
              onSubmit={handleEmailSubmit}
              className={styles.emailPromptForm}
            >
              <label htmlFor="magic-email" className={styles.label}>
                Please enter your email to verify your magic link:
              </label>
              <input
                type="email"
                id="magic-email"
                value={email}
                onChange={handleEmailChange}
                required
                className={styles.input}
                placeholder="Your email address"
                autoComplete="email"
              />
              <PrimaryButton
                id="submit-email"
                btnText="Proceed"
                handleClick={() => {}} // form submit handles action
                className=""
              />
              {error && <div className={styles.error}>{error}</div>}
            </form>
          )}
          {!showEmailPrompt && error && (
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
          {!showEmailPrompt && success && (
            <div className={styles.success}>{success}</div>
          )}
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
