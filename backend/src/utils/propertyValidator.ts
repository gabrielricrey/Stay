import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const newPropertySchema: z.ZodType<NewProperty> = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price_per_night: z.number().nonnegative(),
    user_id: z.uuid(),
    is_available: z.boolean().optional()
});

export const newPropertyValidator = zValidator("json", newPropertySchema);
