"use client";

import { useAuthSession } from "@/context/AuthSessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeClientWrapper from "@/components/wrappers/HomeClientWrapper";
import LoginForm from "@/components/auth/logInForm";
import SignupForm from "@/components/auth/signUpForm";
import ForgotPasswordForm from "@/components/auth/forgotPasswordForm";

type AuthView = 'login' | 'signup' | 'forgot-password';

export default function Home() {
  const { user, loading } = useAuthSession();
  const router = useRouter();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Reset to login view when component mounts
    setAuthView('login');
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    switch (authView) {
      case 'signup':
        return (
          <SignupForm 
            onSwitchToLogin={() => setAuthView('login')}
            initialEmail={userEmail}
            onEmailChange={setUserEmail}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm 
            onSwitchToLogin={() => setAuthView('login')}
            initialEmail={userEmail}
          />
        );
      case 'login':
      default:
        return (
          <LoginForm 
            onSwitchToSignup={() => setAuthView('signup')}
            onForgotPassword={() => setAuthView('forgot-password')}
            onEmailChange={setUserEmail}
            initialEmail={userEmail}
          />
        );
    }
  }

  return <HomeClientWrapper />;
}