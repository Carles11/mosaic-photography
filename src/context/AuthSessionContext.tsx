"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase, SupabaseUser } from "@/lib/supabaseClient";

type AuthContextType = {
  user: SupabaseUser | null;
  loading: boolean;
};

const AuthSessionContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function useAuthSession() {
  return useContext(AuthSessionContext);
}

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          // console.log("AuthSessionContext: Session state:", {
          //   hasSession: !!session,
          //   hasUser: !!session?.user,
          //   userEmail: session?.user?.email,
          // });
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          // console.log("AuthSessionContext: Auth state change:", {
          //   event,
          //   hasSession: !!session,
          //   hasUser: !!session?.user,
          //   userEmail: session?.user?.email,
          // });
          setUser(session?.user ?? null);
          setLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthSessionContext.Provider value={{ user, loading }}>
      {children}
    </AuthSessionContext.Provider>
  );
}
