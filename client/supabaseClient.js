import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// env 未設定（モック開発など）でもアプリが起動できるよう null を許容する
export const supabase =
  url && publishableKey
    ? createClient(url, publishableKey, {
        auth: { flowType: "pkce", detectSessionInUrl: true }
      })
    : null;
