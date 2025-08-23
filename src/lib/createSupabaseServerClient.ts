import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This version is safe for use on the server (SSR/SSG)
export function createSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseKey);
}
