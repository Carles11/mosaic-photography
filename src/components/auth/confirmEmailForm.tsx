"use client";
import styles from "./ResetPasswordForm.module.css"; // Reuse the same styles

interface ConfirmEmailFormProps {
  onSwitchToLogin?: () => void;
}

export default function ConfirmEmailForm({ onSwitchToLogin }: ConfirmEmailFormProps) {
  return (
    <div className={styles.resetPasswordFormContainer}>
      <h2 className={styles.resetPasswordFormTitle}>Email Confirmation</h2>
      <div className={styles.form}>
        <div className={styles.success}>
          Your email has been confirmed successfully! You can now log in with your account.
        </div>
        {onSwitchToLogin && (
          <div className={styles.linksRow}>
            <a
              className={styles.link}
              onClick={onSwitchToLogin}
              tabIndex={0}
              role="button"
            >
              Go to login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
