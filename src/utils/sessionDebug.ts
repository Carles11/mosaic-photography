import { supabase } from "@/lib/supabaseClient";

export const sessionDebug = {
  async checkSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log("Current session:", {
        hasSession: !!session,
        userId: session?.user?.id,
        expiresAt: session?.expires_at,
        refreshToken: session?.refresh_token ? "present" : "missing",
        error,
      });
      return { session, error };
    } catch (error) {
      console.error("Error checking session:", error);
      return { session: null, error };
    }
  },

  async checkUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      console.log("Current user:", {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
        error,
      });
      return { user, error };
    } catch (error) {
      console.error("Error checking user:", error);
      return { user: null, error };
    }
  },

  async refreshSession() {
    try {
      console.log("Manually refreshing session...");
      const { data, error } = await supabase.auth.refreshSession();
      console.log("Refresh result:", {
        hasSession: !!data.session,
        hasUser: !!data.user,
        error,
      });
      return { data, error };
    } catch (error) {
      console.error("Error refreshing session:", error);
      return { data: null, error };
    }
  },
};

// Add this to window for debugging in dev mode
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as unknown as { sessionDebug: typeof sessionDebug }).sessionDebug =
    sessionDebug;
}
