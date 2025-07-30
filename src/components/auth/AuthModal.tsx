"use client";

import { useState } from "react";
import { AuthView } from "@/lib/auth/auth-types";
import LoginForm from "@/components/auth/logInForm";
import SignupForm from "@/components/auth/signUpForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import ResetPasswordForm from "@/components/auth/resetPasswordForm";
import ConfirmEmailForm from "@/components/auth/confirmEmailForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  initialEmail?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialView = "login",
  initialEmail = "",
}: AuthModalProps) {
  const [authView, setAuthView] = useState<AuthView>(initialView);
  const [userEmail, setUserEmail] = useState<string>(initialEmail);

  if (!isOpen) return null;

  const renderAuthForm = () => {
    switch (authView) {
      case "signup":
        return (
          <SignupForm
            onSwitchToLogin={() => setAuthView("login")}
            initialEmail={userEmail}
            onEmailChange={setUserEmail}
            onSuccess={() => setAuthView("login")}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setAuthView("login")}
            initialEmail={userEmail}
          />
        );
      case "reset-password":
        return (
          <ResetPasswordForm
            onSwitchToLogin={() => setAuthView("login")}
            onSuccess={onClose}
          />
        );
      case "confirm-email":
        return (
          <ConfirmEmailForm onSwitchToLogin={() => setAuthView("login")} />
        );
      case "login":
      default:
        return (
          <LoginForm
            onSwitchToSignup={() => setAuthView("signup")}
            onForgotPassword={() => setAuthView("forgot-password")}
            onEmailChange={setUserEmail}
            initialEmail={userEmail}
            onSuccess={onClose}
          />
        );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={{ position: "relative" }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "76px",
            right: "11px",
            color: "#000",
            background: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            fontSize: "18px",
            zIndex: 1001,
          }}
        >
          ×
        </button>
        {renderAuthForm()}
      </div>
    </div>
  );
}
