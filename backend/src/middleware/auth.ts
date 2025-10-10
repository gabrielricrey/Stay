import { type SupabaseClient, type User } from "@supabase/supabase-js";
import { type Context, type Next } from "hono";
import { createSupabaseForRequest } from "../lib/supabase.js";

declare module "hono" {
    interface ContextVariableMap {
        supabase: SupabaseClient;
        user: User | null
    }
}

export async function withSupabase(c: Context, next: Next) {
    let sb = c.get("supabase");

    if (!sb) {
        sb = createSupabaseForRequest(c);
        c.set("supabase", sb);
    }

    const { data: { user }, error } = await sb.auth.getUser();

    if (error && error.code === "session_expired") {
        const { data, error: refreshError } = await sb.auth.refreshSession();

        if (!refreshError && data.user) {
            c.set("user", data.user);
        } else {
            console.warn("Session refresh failed:", refreshError?.message);
            c.set("user", null);
        }

    } else if (error) {
        console.warn("Authentication error:", error.message);
        c.set("user", null);
    } else {
        c.set("user", user);
    }

    return next();
}

export async function requireAuth(c: Context, next: Next) {
    if (!c.get("user")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    return next();
}