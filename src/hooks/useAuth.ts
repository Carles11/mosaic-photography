"use client";

import { useRouter } from "next/navigation";
import { useAuthSession } from "@/context/AuthSessionContext";
import { signOut } from "@/lib/auth/auth-helpers";

export function useAuth() {
  const { user, loading } = useAuthSession();
  const router = useRouter();

  const logout = async () => {
    const result = await signOut();
    if (!result.error) {
      router.push("/");
    }
    return result;
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
}
