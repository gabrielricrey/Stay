import { Hono } from "hono";
import { newBookingValidator } from "../utils/bookingValidator.js";
import { requireAuth } from "../middleware/auth.js";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { differenceInCalendarDays } from "date-fns";


const bookingApp = new Hono({ strict: false });

bookingApp.post('/', requireAuth, newBookingValidator, async (c) => {
    try {
        const booking: NewBooking = c.req.valid("json");
        const sb = c.get("supabase");

        // Fetch property to see if still available
        const response1: PostgrestSingleResponse<Property> = await sb.from("properties").select().eq("id", booking.property_id).single();

        if (response1.error) {
            console.error("Error getting property:", response1.error.code, response1.error.message);
            return c.json({ message: "Oops, something went wrong, try again!" }, 400);
        }

        if (!response1.data.is_available) {
            return c.json({ message: "Bad luck, property not available anymore" }, 400);
        }

        // Fetch bookings on property to check overlapping dates with new booking.
        const response2: PostgrestSingleResponse<Booking[]> = await sb.from("bookings").select("*").eq("property_id", booking.property_id).neq("status", "cancelled");

        if (response2.error) {
            console.error("Error getting bookings:", response2.error.code, response2.error.message);
            return c.json({ message: "Oops, something went wrong, try again!" }, 400);
        }

        if (response2.data.length !== 0) {
            const isOverlapping = response2.data.some(b => booking.check_in_date <= b.check_out_date && booking.check_out_date >= b.check_in_date)
            if (isOverlapping) {
                return c.json({ message: "Property not available these dates, try other dates!" }, 400);
            }
        }

        const userId = c.get("user")?.id;
        const amountOfDays = differenceInCalendarDays(new Date(booking.check_out_date), new Date(booking.check_in_date));
        booking.total_cost = response1.data.price_per_night * amountOfDays;
        booking.user_id = userId!

        const response: PostgrestSingleResponse<Booking> = await sb.from("bookings").insert(booking).select().single()

        if (response.error) {
            console.error("Error creating booking:", response.error.code, response.error.message);
            return c.json({ message: "Oops, something went wrong, try again!" }, 400);
        }

        return c.json({ message: "Booking successfully created!", bookingId: response.data.id }, 201)

    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal server error" }, 500);
    }
})


export default bookingApp;