import dotenv from "dotenv";
dotenv.config();

const _supabaseUrl = process.env.SUPABASE_URL;
const _supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!_supabaseUrl || !_supabaseKey) {
    throw new Error("Environment variables missing")
};

export const supabaseUrl = _supabaseUrl
export const supabaseKey = _supabaseKey