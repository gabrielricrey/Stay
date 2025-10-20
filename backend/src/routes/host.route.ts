import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { validate as isUUID } from "uuid";

const hostApp = new Hono({ strict: false })

hostApp.get('/properties', requireAuth, async (c) => {
    try {

        const sb = c.get("supabase");
        const userId = c.get("user")!.id;

        const response: PostgrestSingleResponse<Property[]> = await sb
            .from("properties")
            .select('*')
            .eq("user_id", userId);

        const { data, error } = response;

        if (error) {
            console.error("Error getting properties:", error.code, error.message)
            return c.json({ message: "Oops, something went wrong, try again!" }, 400)
        }

        if (data.length === 0) {
            return c.json({ message: "You have no properties at the moment" }, 200);
        }
        return c.json({ message: "Success fetching properties", properties: data }, 200);
    } catch (error) {
        console.error("Error getting properties:", error)
        return c.json({ message: "Internal server error" }, 500);

    }
})
hostApp.get('/properties/:id', requireAuth, async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on id!" }, 400)
        }

        const sb = c.get("supabase");
        const response: PostgrestSingleResponse<Property> = await sb
            .from("properties")
            .select('*')
            .eq("id", id)
            .single();

        const { data, error } = response;

        if (error) {
            console.error("Error getting properties:", error.code, error.message)
            return c.json({ message: "Oops, something went wrong, try again!" }, 400)
        }

        return c.json({ message: "Success fetching property", property: data }, 200);
    } catch (error) {
        console.error("Error getting properties:", error)
        return c.json({ message: "Internal server error" }, 500);

    }
})

hostApp.get('/bookings', requireAuth, async (c) => {

})

export default hostApp;