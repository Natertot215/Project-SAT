import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in the project values.",
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export const QUESTION_COLUMNS =
  "id, section, skill, difficulty, passage, stem, choices, correctIndex:correct_index, explanation, chartData:chart_data, imagePath:image_path";
