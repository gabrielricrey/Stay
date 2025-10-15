import { Hono } from "hono";
import { newPropertyValidator } from "../utils/propertyValidator.js";
import { requireAuth } from "../middleware/auth.js";
import { validate as isUUID } from "uuid"

const propertyApp = new Hono({ strict: false });


propertyApp.post('/', requireAuth, newPropertyValidator, async (c) => {
    try {
        const property: NewProperty = c.req.valid("json");
        const sb = c.get("supabase");
        const { data, error } = await sb.from("properties").insert(property).select().single()

        if (error) {
            console.error("Error creating property:", error.code, error.message);
            return c.json({ error: "Error" }, 400);
        }

        return c.json({ message: "Property successfully created", property: { id: data.id, name: data.name } })

    } catch (error) {
        console.error(error);
        return c.json({ error: "Internal server error" }, 500);
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
            return c.json({ message: "Error, no property with this id" }, 400)
        }

        return c.json({ message: "Property succesfully deleted", property: data.name })
    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal server error" }, 500)
    }
})

export default propertyApp;