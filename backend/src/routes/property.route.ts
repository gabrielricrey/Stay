import { Hono } from "hono";
import { newPropertyValidator } from "../utils/propertyValidator.js";
import { propertiesQueryValidator } from "../utils/queryPropertiesValidator.js";
import { requireAuth } from "../middleware/auth.js";
import { validate as isUUID } from "uuid"
import type { PostgrestSingleResponse } from "@supabase/supabase-js";


const propertyApp = new Hono({ strict: false });

propertyApp.get('/', propertiesQueryValidator, async (c) => {
    try {
        const query = c.req.valid("query");

        const offset = query.offset ? query.offset : 0
        const limit = query.limit ? query.limit : 10
        const startIndex = offset > 0 ? (offset - 1) : 0
        const endIndex = startIndex + (limit - 1);
        const order = query.sort_by ? query.sort_by : "name";

        const sb = c.get("supabase");

        const _query = sb.from("properties").select("*", { count: "exact" }).eq("is_available", true).range(startIndex, endIndex).order(order, { ascending: true })

        if (query.q) {
            _query.or(`name.ilike.%${query.q}%,description.ilike.%${query.q}%`)
        }

        const response: PostgrestSingleResponse<Property[]> = await _query;
        console.log(response);

        if (response.error) {
            console.error("Error getting properties:", response.error.code, response.error.message)
            return c.json({ message: "Error getting properties" }, 400)
        }

        if (response.data.length === 0) {
            return c.json({ message: "No properties available" }, 400)
        }

        const defaultResponse: PaginatedListResponse<Property> = {
            data: response.data,
            offset,
            limit,
            count: response.count || 0
        }
        console.log(response.data);
        return c.json({ message: "Success getting properties", properties: defaultResponse }, 200)
    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal server error" }, 500)
    }
})

propertyApp.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on ID" }, 400)
        }

        const sb = c.get("supabase");
        const response: PostgrestSingleResponse<Property> = await sb.from("properties").select().eq("id", id).single();

        if (response.error) {
            console.error("Error getting property:", response.error.code, response.error.message)
            return c.json({ message: "Error, no property with this ID" }, 400)
        }

        return c.json({ message: "Success getting property", property: { id: response.data.id, name: response.data.name } }, 200)
    } catch (error) {
        console.error("Error getting property:", error)
        return c.json({ message: "Internal server error" }, 500)
    }
})

propertyApp.post('/', requireAuth, newPropertyValidator, async (c) => {
    try {
        const property: NewProperty = c.req.valid("json");
        const sb = c.get("supabase");
        const { data, error } = await sb.from("properties").insert(property).select().single()

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

propertyApp.put('/:id', requireAuth, newPropertyValidator, async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on ID" }, 400)
        }

        const data = c.req.valid("json");
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

propertyApp.delete('/:id', requireAuth, async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on ID" }, 400)
        }

        const sb = c.get("supabase");
        const { data, error } = await sb.from("properties").delete().eq('id', id).select().single();

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

export default propertyApp;