import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const schema: z.ZodType<NewBooking> = z.object({
    property_id: z.string(),
    check_in_date: z.string(),
    check_out_date: z.string()
})

export const newBookingValidator = zValidator("json", schema)