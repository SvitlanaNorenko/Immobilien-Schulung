//to conect with supabase
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config(); //include dotenv library to use var - env and read this file

const supabaseUrl = "https://uddwvhkgbecwaerhcbil.supabase.co";
const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;
