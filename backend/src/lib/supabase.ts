import dotenv from "dotenv";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { SupabaseClient } from "@supabase/supabase-js";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables has not been added")
}

export function createSupabaseForRequest(c: Context): SupabaseClient {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return parseCookieHeader(c.req.header("Cookie") ?? "").map(
                    ({ name, value }) => ({ name, value: value ?? "" })
                );
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    setCookie(c, name, value, {
                        ...options,
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        path: "/",
                    });
                });
            },
        },
    });
}
