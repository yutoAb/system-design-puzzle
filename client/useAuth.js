import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(() => {
    supabase?.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  }, []);

  const signOut = useCallback(() => {
    supabase?.auth.signOut();
  }, []);

  return {
    enabled: Boolean(supabase),
    user: session?.user ?? null,
    accessToken: session?.access_token ?? null,
    loading,
    signInWithGoogle,
    signOut
  };
}
