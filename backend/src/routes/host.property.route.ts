import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { validate as isUUID } from "uuid";
import { newPropertyValidator } from "../utils/propertyValidator.js";

const hostPropertyApp = new Hono({ strict: false })

hostPropertyApp.get('/', requireAuth, async (c) => {
    try {
        const sb = c.get("supabase");
        const userId = c.get("user")!.id;

        const response: PostgrestSingleResponse<PropertyPreview[]> = await sb
            .from("properties")
            .select('id,name,image_url')
            .eq("user_id", userId);

        const { data, error } = response;

        if (error) {
            console.error("Error fetching properties:", error.code, error.message)
            return c.json({ message: "Oops, something went wrong, try again!" }, 400)
        }

        if (data.length === 0) {
            return c.json({ message: "You have no properties at the moment" }, 200);
        }
        return c.json({ message: "Success fetching properties", properties: data }, 200);
    } catch (error) {
        console.error("Error fetching properties:", error)
        return c.json({ message: "Internal server error" }, 500);

    }
})
hostPropertyApp.get('/:id', requireAuth, async (c) => {
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
            console.error("Error fetching property:", error.code, error.message)
            if (error.code === 'PGRST116') {
                return c.json({ message: "Property doesn't exist" }, 404);
            }

            return c.json({ message: "Oops, something went wrong, try again!" }, 400)
        }

        return c.json({ message: "Success fetching property", property: data }, 200);
    } catch (error) {
        console.error("Error fetching property:", error)
        return c.json({ message: "Internal server error" }, 500);

    }
})

hostPropertyApp.post('/', requireAuth, newPropertyValidator, async (c) => {
    try {
        const sb = c.get("supabase");
        const userId = c.get("user")!.id;
        let property: NewProperty = c.req.valid("json");
        property.user_id = userId;
        const response: PostgrestSingleResponse<Property> = await sb.from("properties").insert(property).select().single();

        const { data, error } = response;

        if (error) {
            console.error("Error creating property:", error.code, error.message);
            return c.json({ message: "Error" }, 400);
        }

        return c.json({ message: "Property successfully created", property: { id: data.id, name: data.name } })

    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal server error" }, 500);
    }
})

hostPropertyApp.put('/:id', requireAuth, newPropertyValidator, async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on ID" }, 400)
        }

        const data: Partial<Property> = c.req.valid("json");
        data.updated_at = new Date().toISOString();
        const sb = c.get("supabase");
        const response: PostgrestSingleResponse<Property> = await sb.from("properties").update(data).eq("id", id).select().single();

        if (response.error) {
            console.error("Error updating property:", response.error.code, response.error.message)
            return c.json({ message: "Error updating property" }, 400)
        }

        return c.json({ message: "Success updating property", property: response.data }, 200)

    } catch (error) {
        console.error("Error updating property:", error)
        return c.json({ message: "Internal server error" }, 500)

    }
})

hostPropertyApp.delete('/:id', requireAuth, async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on ID" }, 400)
        }

        const sb = c.get("supabase");
        const response: PostgrestSingleResponse<Property> = await sb.from("properties").delete().eq('id', id).select().single();

        const { data, error } = response;

        if (error) {
            console.error("Error deleting property", error.code, error.message)
            return c.json({ message: "Error, no property with this ID" }, 400)
        }

        return c.json({ message: "Property succesfully deleted", property: data.name })
    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal server error" }, 500)
    }
})

export default hostPropertyApp;