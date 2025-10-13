import { createClient } from "@supabase/supabase-js";
import {
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
} from "../../constant";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
export const adminAuthClient = supabaseAdmin.auth.admin;
