import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { validate as isUUID } from "uuid";
import { hostEditBookingValidator } from "../utils/bookingValidator.js";

const hostBookingApp = new Hono({ strict: false })

hostBookingApp.get('/', requireAuth, async (c) => {
    try {

        const sb = c.get("supabase");
        const userId = c.get("user")!.id;

        const response: PostgrestSingleResponse<PropertyWithBookings[]> = await sb
            .from("properties")
            .select('*, bookings(*)')
            .eq("user_id", userId);

        const { data, error } = response;

        if (error) {
            console.error("Error fetching bookings:", error.code, error.message)
            return c.json({ message: "Oops, something went wrong, try again!" }, 400)
        }

        if (data.length === 0) {
            return c.json({ message: "You have no bookings at the moment" }, 200);
        }
        return c.json({ message: "Success fetching properties with bookings", propertiesAndBookings: data }, 200);
    } catch (error) {
        console.error("Error fetching bookings:", error)
        return c.json({ message: "Internal server error" }, 500);

    }
})

hostBookingApp.get('/:id', requireAuth, async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on id!" }, 400)
        }

        const sb = c.get("supabase");
        const response: PostgrestSingleResponse<Booking> = await sb
            .from("bookings")
            .select('*')
            .eq("id", id)
            .single();

        const { data, error } = response;

        if (error) {
            console.error("Error fetching booking:", error.code, error.message)
            return c.json({ message: "Oops, something went wrong, try again!" }, 400)
        }

        return c.json({ message: "Success fetching booking", booking: data }, 200);
    } catch (error) {
        console.error("Error fetching booking:", error)
        return c.json({ message: "Internal server error" }, 500);

    }
})



hostBookingApp.put('/:id', requireAuth, hostEditBookingValidator, async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on ID" }, 400)
        }

        const sb = c.get("supabase");
        const userId = c.get("user")!.id;
        const res: PostgrestSingleResponse<BookingWithProperty> = await sb.from("bookings").select('*,properties(user_id)').eq("id", id).single();

        const { data: booking, error } = res;

        if (error) {
            console.error("Error fetchin booking:", error.code, error.message);
            return c.json({ message: "Booking not found" }, 404);
        }

        if (booking.property.user_id !== userId) {
            return c.json({ message: "Not authorized to modify this booking" }, 403);
        }

        const data = c.req.valid("json");

        if (data.status !== 'confirmed' && data.status !== 'cancelled') {
            return c.json({ message: "You are not allowed to change status to this type" }, 400);
        }

        const response: PostgrestSingleResponse<Booking> = await sb.from("bookings").update(data).eq("id", id).select().single();

        if (response.error) {
            console.error("Error updating booking:", response.error.code, response.error.message);

            return c.json({ message: "Error updating booking" }, 400);
        }

        return c.json({ message: "Success updating booking", booking: response.data }, 200)

    } catch (error) {
        console.error("Error updating booking:", error)
        return c.json({ message: "Internal server error" }, 500)

    }
})



export default hostBookingApp;