// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  console.log("Check your .env file:");
  console.log("VITE_SUPABASE_URL=", supabaseUrl);
  console.log(
    "VITE_SUPABASE_ANON_KEY=",
    supabaseAnonKey ? "exists" : "missing"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
