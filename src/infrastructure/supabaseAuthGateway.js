import { createClient } from "@supabase/supabase-js";

export const AUTH_ERROR = "ログインが必要です";

export function createSupabaseAuthGateway({ url, secretKey, mock = false }) {
  if (mock) {
    return {
      async verifyToken(token) {
        if (!token) {
          throw new Error(AUTH_ERROR);
        }
        return {
          userId: "00000000-0000-0000-0000-000000000001",
          email: "mock@example.com"
        };
      }
    };
  }

  if (!url || !secretKey) {
    return null;
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return {
    async verifyToken(token) {
      if (!token) {
        throw new Error(AUTH_ERROR);
      }
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        throw new Error(AUTH_ERROR);
      }
      return { userId: data.user.id, email: data.user.email };
    }
  };
}
