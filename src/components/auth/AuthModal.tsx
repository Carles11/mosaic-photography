// "use client";

// // React imports first
// import { useState } from "react";

// // Type imports
// import { AuthModalProps, AuthView } from "@/types/auth";

// // Component imports alphabetically
// import ConfirmEmailChangeForm from "@/components/auth/confirmEmailChangeForm";
// import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
// import LoginForm from "@/components/auth/logInForm";
// import MagicLinkForm from "@/components/auth/magicLinkForm";
// import PasswordResetForm from "@/components/auth/resetPasswordForm";
// import SignupForm from "@/components/auth/signUpForm";
// import VerifyEmailForm from "@/components/auth/verifyEmailForm";

// export default function AuthModal({
//   isOpen,
//   onClose,
//   initialView = "login",
//   initialEmail = "",
// }: AuthModalProps) {
//   const [authView, setAuthView] = useState<AuthView>(initialView);
//   const [userEmail, setUserEmail] = useState<string>(initialEmail);

//   if (!isOpen) return null;

//   const renderAuthForm = () => {
//     switch (authView) {
//       case "signup":
//         return (
//           <SignupForm
//             onSwitchToLogin={() => setAuthView("login")}
//             initialEmail={userEmail}
//             onEmailChange={setUserEmail}
//             onSuccess={() => setAuthView("login")}
//           />
//         );
//       case "forgot-password":
//         return (
//           <ForgotPasswordForm
//             onSwitchToLogin={() => setAuthView("login")}
//             initialEmail={userEmail}
//           />
//         );
//       case "password-reset":
//         return (
//           <PasswordResetForm
//             onSwitchToLogin={() => setAuthView("login")}
//             onSuccess={onClose}
//           />
//         );
//       case "verify-email":
//         return (
//           <VerifyEmailForm
//             onSwitchToLogin={() => setAuthView("login")}
//             onSuccess={onClose}
//           />
//         );
//       case "magic-link":
//         return (
//           <MagicLinkForm
//             onSwitchToLogin={() => setAuthView("login")}
//             onSuccess={onClose}
//           />
//         );
//       case "confirm-email-change":
//         return (
//           <ConfirmEmailChangeForm
//             onSwitchToLogin={() => setAuthView("login")}
//             onSuccess={onClose}
//           />
//         );
//       case "login":
//       default:
//         return (
//           <LoginForm
//             onSwitchToSignup={() => setAuthView("signup")}
//             onForgotPassword={() => setAuthView("forgot-password")}
//             onEmailChange={setUserEmail}
//             initialEmail={userEmail}
//             onSuccess={onClose}
//           />
//         );
//     }
//   };

//   return (
//     <div>
//       {/* Modal content here */}
//       {renderAuthForm()}
//     </div>
//   );
// }
