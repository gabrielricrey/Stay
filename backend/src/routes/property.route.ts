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
            console.error("Error fetching properties:", response.error.code, response.error.message)
            return c.json({ message: "Error fetching properties" }, 400)
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
        return c.json({ message: "Success fetching properties", properties: defaultResponse }, 200)
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
            console.error("Error fetching property:", response.error.code, response.error.message)
            return c.json({ message: "Error, no property with this ID" }, 400)
        }

        return c.json({ message: "Success fetching property", property: response.data }, 200)
    } catch (error) {
        console.error("Error fetching property:", error)
        return c.json({ message: "Internal server error" }, 500)
    }
})



export default propertyApp;