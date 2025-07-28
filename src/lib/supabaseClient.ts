import { createClient, User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables.");
}

// Only log in development
if (process.env.NODE_ENV === "development") {
  console.log("Supabase URL:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type SupabaseUser = User;
