import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const newBookingschema: z.ZodType<NewBooking> = z.object({
    property_id: z.string(),
    check_in_date: z.string(),
    check_out_date: z.string(),
});

const editBookingschema: z.ZodType<Partial<Booking>> = z.object({
    property_id: z.string(),
    check_in_date: z.string().optional(),
    check_out_date: z.string().optional(),
    status: z.enum(["pending", "cancelled", "confirmed", "completed"]).optional()
});

export const newBookingValidator = zValidator("json", newBookingschema);
export const editBookingValidator = zValidator("json", editBookingschema);