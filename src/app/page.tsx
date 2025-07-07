"use client";

import { useAuthSession } from "@/context/AuthSessionContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import HomeClientWrapper from "@/components/wrappers/HomeClientWrapper";
import LoginForm from "@/components/auth/logInForm";
import SignupForm from "@/components/auth/signUpForm";
import ForgotPasswordForm from "@/components/auth/forgotPasswordForm";
import ResetPasswordForm from "@/components/auth/resetPasswordForm";
import ConfirmEmailForm from "@/components/auth/confirmEmailForm";

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'confirm-email';

export default function Home() {
  const { user, loading } = useAuthSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle URL parameters on initial load
  useEffect(() => {
    if (!isInitialized && searchParams) {
      const modal = searchParams.get('modal');
      const type = searchParams.get('type');
      
      console.log('URL params:', { modal, type }); // Debug log
      
      if (modal === 'auth') {
        setShowAuthModal(true);
        if (type === 'reset-password') {
          console.log('Setting authView to reset-password'); // Debug log
          setAuthView('reset-password');
        } else if (type === 'confirm-email') {
          console.log('Setting authView to confirm-email'); // Debug log
          setAuthView('confirm-email');
        } else {
          console.log('Setting authView to login (default)'); // Debug log
          setAuthView('login');
        }
      }
      setIsInitialized(true);
    }
  }, [searchParams, isInitialized]);

  // Handle modal closing
  useEffect(() => {
    if (isInitialized && !showAuthModal) {
      console.log('Modal closed, resetting state'); // Debug log
      setAuthView('login');
      setUserEmail('');
      // Clear URL parameters when modal is closed
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('modal');
        url.searchParams.delete('type');
        router.replace(url.pathname);
      }
    }
  }, [showAuthModal, router, isInitialized]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAuthModal(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <HomeClientWrapper 
        showLoginButton={!user} 
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={handleLogout}
        user={user}
      />
      
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ position: 'relative' }}>
            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '76px',
                right: '11px',
                color: '#000',
                background: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '18px',
                zIndex: 1001
              }}
            >
              ×
            </button>
            
            {(() => {
              console.log('Current authView:', authView); // Debug log
              switch (authView) {
                case 'signup':
                  return (
                    <SignupForm 
                      onSwitchToLogin={() => setAuthView('login')}
                      initialEmail={userEmail}
                      onEmailChange={setUserEmail}
                      onSuccess={() => setAuthView('login')}
                    />
                  );
                case 'forgot-password':
                  return (
                    <ForgotPasswordForm 
                      onSwitchToLogin={() => setAuthView('login')}
                      initialEmail={userEmail}
                    />
                  );
                case 'reset-password':
                  return (
                    <ResetPasswordForm 
                      onSwitchToLogin={() => setAuthView('login')}
                      onSuccess={() => setShowAuthModal(false)}
                    />
                  );
                case 'confirm-email':
                  return (
                    <ConfirmEmailForm 
                      onSwitchToLogin={() => setAuthView('login')}
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
                      onSuccess={() => setShowAuthModal(false)}
                    />
                  );
              }
            })()}
          </div>
        </div>
      )}
    </>
  );
}