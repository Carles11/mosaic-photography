"use client";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Or use router.refresh()
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}