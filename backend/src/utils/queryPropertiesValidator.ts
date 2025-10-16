import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const schema: z.ZodType<PropertiesQuery> = z.object({
    offset: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    q: z.string().optional(),
    sort_by: z.enum(["name", "created_at", "price_per_night"]).optional(),

})

export const propertiesQueryValidator = zValidator("query", schema);