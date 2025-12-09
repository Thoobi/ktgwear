import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "../../constant";

// Validate environment variables at module initialization so the error is
// explicit and actionable instead of coming from deep inside the minified
// supabase bundle. This helps diagnose missing VITE_ env values in deploys.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your build environment. Do NOT expose your service role key to the client."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// IMPORTANT: Do not create or export a service-role / admin client from code
// that runs in the browser. Service role keys must stay server-side. If you
// need admin functionality, implement server endpoints that use the service
// role key and call them from the client.
