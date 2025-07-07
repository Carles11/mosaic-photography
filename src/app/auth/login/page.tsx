import LoginForm from "@/components/auth/logInForm";

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Login</h1>
      <LoginForm />
    </div>
  );
}