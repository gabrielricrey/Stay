import { Hono } from "hono"
import { requireAuth } from "../middleware/auth.js"
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { userProfileValidator } from "../utils/userProfileValidator.js";
const userApp = new Hono({ strict: false })

userApp.get('/', requireAuth, async (c) => {
    try {
        const userId = c.get("user")?.id;
        const sb = c.get("supabase");
        const response: PostgrestSingleResponse<UserProfile> = await sb.from("user_profiles").select("*").eq("id", userId).single();
        const { data, error } = response;


        if (error) {
            console.error("Error fetching user profile:", error.code, error.message);
            return c.json({ message: "Error fetching user profile" }, 400);
        }

        if (!data) {
            return c.json({ message: "User profile not found" }, 404);
        }

        return c.json({ data }, 200);

    } catch (error) {
        console.error("Error fetching user profile:", error);
        return c.json({ message: "Internal server error" }, 500);
    }

});

userApp.put('/', userProfileValidator, requireAuth, async (c) => {
    try {
        const userId = c.get("user")?.id;
        const sb = c.get("supabase");
        const profileUpdates: Partial<UserProfile> = c.req.valid("json");

        profileUpdates.updated_at = new Date().toISOString();

        const response: PostgrestSingleResponse<UserProfile> = await sb.from("user_profiles").update(profileUpdates).eq("id", userId).select().single();

        const { data, error } = response;

        if (error) {
            console.error("Error updating user profile:", error.code, error.message);
            return c.json({ message: "Error updating user profile" }, 400);
        }

        return c.json({ message: "Success updating user profile", profile: data }, 200);

    } catch (error) {
        console.error("Error updating user profile:", error);
        return c.json({ message: "Internal server error" }, 500);
    }
});

export default userApp;