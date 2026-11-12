import { useCallback, useEffect, useState } from "react";
import { publishableKey, supabase, url } from "./supabaseClient.js";

// ログイン基盤に届かないと getSession が返らず、画面が「確認中…」で固まる。
// 一定時間で打ち切り、未ログインとして表示を続ける。
const SESSION_TIMEOUT_MS = 6000;
const REACHABILITY_TIMEOUT_MS = 5000;

async function authServiceReachable() {
  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: publishableKey },
      signal: AbortSignal.timeout(REACHABILITY_TIMEOUT_MS)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }
    let settled = false;
    const settle = (nextSession) => {
      settled = true;
      clearTimeout(timer);
      setSession(nextSession ?? null);
      setLoading(false);
      setUnavailable(false);
    };
    const timer = setTimeout(() => {
      if (!settled) {
        setLoading(false);
        setUnavailable(true);
      }
    }, SESSION_TIMEOUT_MS);

    supabase.auth
      .getSession()
      .then(({ data }) => settle(data.session))
      .catch(() => {
        clearTimeout(timer);
        setLoading(false);
        setUnavailable(true);
      });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) =>
      settle(nextSession)
    );
    return () => {
      clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      return;
    }
    // つながらないホストへ遷移するとブラウザのエラー画面になるので、先に確かめる
    if (!(await authServiceReachable())) {
      setUnavailable(true);
      return;
    }
    setUnavailable(false);
    supabase.auth.signInWithOAuth({
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
    unavailable,
    signInWithGoogle,
    signOut
  };
}
