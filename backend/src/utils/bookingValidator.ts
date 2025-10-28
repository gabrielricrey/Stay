import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const newBookingschema: z.ZodType<NewBooking> = z.object({
    property_id: z.string(),
    check_in_date: z.string(),
    check_out_date: z.string(),
});

const editBookingschema: z.ZodType<Partial<Booking>> = z.object({
    check_in_date: z.string().optional(),
    check_out_date: z.string().optional(),
    status: z.enum(["pending", "cancelled", "confirmed", "completed"]).optional()
});

const hostEditBookingschema: z.ZodType<Partial<Booking>> = z.object({
    status: z.enum(["confirmed", "cancelled"])
});

export const newBookingValidator = zValidator("json", newBookingschema);
export const editBookingValidator = zValidator("json", editBookingschema);
export const hostEditBookingValidator = zValidator("json", hostEditBookingschema);