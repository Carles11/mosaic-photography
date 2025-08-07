import { supabase, SupabaseUser } from "@/lib/supabaseClient";

export type AuthError = {
  message: string;
  status?: number;
};

export type AuthResult<T = unknown> = {
  data?: T;
  error?: AuthError;
};

/**
 * Sign in with email and password
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult<{ user: SupabaseUser | null }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: { user: data.user } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<AuthResult<{ user: SupabaseUser | null }>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: { user: data.user } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: { message: "Password reset email sent" } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: { message: "Password updated successfully" } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: { message: "Signed out successfully" } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: { session } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { error: { message: error.message } };
    }

    return { data: { user } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    };
  }
}
