// Auth-related types
export type AuthView =
  | "login"
  | "signup"
  | "forgot-password"
  | "password-reset"
  | "magic-link"
  | "confirm-email-change"
  | "verify-email";

export type AuthModalState = {
  isOpen: boolean;
  view: AuthView;
  email?: string;
};

export type AuthFormProps = {
  onSwitchToLogin?: () => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: () => void;
  onEmailChange?: (email: string) => void;
  onSuccess?: () => void;
  initialEmail?: string;
  redirectTo?: string;
  showSwitchLinks?: boolean;
};

export type AuthLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  initialEmail?: string;
}

export interface LoginFormProps {
  onSwitchToSignup?: () => void;
  onForgotPassword?: () => void;
  onEmailChange?: (email: string) => void;
  initialEmail?: string;
  onSuccess?: () => void;
  redirectTo?: string;
}

export interface DesktopNavDropdownProps {
  user?: import("@/lib/supabaseClient").SupabaseUser | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  // onGoProClick?: () => void;
  onClose: () => void;
}

export interface DropdownProps {
  buttonText: string;
  items: { store: string; website: string; affiliate: boolean }[];
  onToggle?: (isOpen: boolean) => void;
}

export interface DesktopNavProps {
  user?: import("@/lib/supabaseClient").SupabaseUser | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  // onGoProClick?: () => void;
}

export interface DesktopNavButtonProps {
  user?: import("@/lib/supabaseClient").SupabaseUser | null;
  isOpen: boolean;
  onClick: () => void;
}
