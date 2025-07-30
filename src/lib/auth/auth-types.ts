export type AuthView =
  | "login"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "confirm-email";

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
