"use client";

import { useAuthSession } from "@/context/AuthSessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import HomeClientWrapper from "@/components/wrappers/HomeClientWrapper";
import LoginForm from "@/components/auth/logInForm";
import SignupForm from "@/components/auth/signUpForm";
import ForgotPasswordForm from "@/components/auth/forgotPasswordForm";

type AuthView = 'login' | 'signup' | 'forgot-password';

export default function Home() {
  const { user, loading } = useAuthSession();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Reset auth view when modal is closed
    if (!showAuthModal) {
      setAuthView('login');
      setUserEmail('');
    }
  }, [showAuthModal]);

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