import { Hono } from "hono";
import { newBookingValidator, editBookingValidator } from "../utils/bookingValidator.js";
import { requireAuth } from "../middleware/auth.js";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { differenceInCalendarDays } from "date-fns";
import { validate as isUUID } from "uuid";


const bookingApp = new Hono({ strict: false });

bookingApp.get('/', requireAuth, async (c) => {
    try {
        const sb = c.get("supabase");
        const userId = c.get("user")?.id

        const response: PostgrestSingleResponse<Booking[]> = await sb.from("bookings").select().eq("user_id", userId);

        const { data, error } = response;

        if (error) {
            console.error("Error fetching bookings:", error.code, error.message)
            return c.json({ message: "Oops something went wrong, try again" }, 400)
        }

        if (data.length === 0) {
            return c.json({ message: "You have no bookings" }, 200)
        }

        return c.json({ bookings: data }, 200)
    } catch (error) {
        console.error("Error fetching bookings:", error)
        return c.json({ message: "Internal server error" }, 500)
    }
})

bookingApp.get('/:id', requireAuth, async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on ID" }, 400)
        }

        const sb = c.get("supabase");
        const response: PostgrestSingleResponse<BookingWithProperty> = await sb.from("bookings").select('*,properties(name) ').eq("id", id).single();

        const { data, error } = response;

        if (error) {
            console.error("Error fetching booking:", error.code, error.message)
            return c.json({ message: "Oops something went wrong, try again" }, 400)
        };


        return c.json({ booking: data }, 200)
    } catch (error) {
        console.error("Error fetching booking:", error)
        return c.json({ message: "Internal server error" }, 500)
    }
})

bookingApp.post('/', requireAuth, newBookingValidator, async (c) => {
    try {
        const booking: NewBooking = c.req.valid("json");
        const sb = c.get("supabase");

        // Fetch property to see if still available
        const response1: PostgrestSingleResponse<Property> = await sb.from("properties").select().eq("id", booking.property_id).single();

        if (response1.error) {
            console.error("Error fetching property:", response1.error.code, response1.error.message);
            return c.json({ message: "Oops, something went wrong, try again!" }, 400);
        }

        if (!response1.data.is_available) {
            return c.json({ message: "Bad luck, property not available anymore" }, 400);
        }

        const userId = c.get("user")?.id;
        const amountOfDays = differenceInCalendarDays(new Date(booking.check_out_date), new Date(booking.check_in_date));
        booking.total_cost = response1.data.price_per_night * amountOfDays;
        booking.user_id = userId!

        const response: PostgrestSingleResponse<Booking> = await sb.from("bookings").insert(booking).select().single()

        const { data, error } = response;

        if (error) {
            console.error("Error creating booking:", error.code, error.message);
            if (error.message === 'Property already booked for these dates')
                return c.json({ message: "Property already booked for these dates" }, 400);
            return c.json({ message: "Oops, something went wrong, try again!" }, 400);
        }

        return c.json({ message: "Booking successfully created!", bookingId: data.id }, 201)

    } catch (error) {
        console.error(error);
        return c.json({ message: "Internal server error" }, 500);
    }
})

bookingApp.put('/:id', requireAuth, editBookingValidator, async (c) => {
    try {
        const id = c.req.param('id');

        if (!isUUID(id)) {
            return c.json({ message: "Wrong format on ID" }, 400)
        }

        const sb = c.get("supabase");
        const res: PostgrestSingleResponse<Booking> = await sb.from("bookings").select().eq("id", id).single();

        const { data: booking, error: err } = res;

        if (err) {
            console.error("Error fetching booking:", err.code, err.message);
            return c.json({ message: "Oops, something went wrong, try again!" }, 400)
        }

        const userId = c.get("user")?.id
        const res1: PostgrestSingleResponse<UserProfile> = await sb.from("user_profiles").select().eq("id", userId).single();

        const { data: user, error: getUserError } = res1;

        if (getUserError) {
            console.error("Error fetching user:", getUserError.code, getUserError.message);
            return c.json({ message: "Oops, something went wrong, try again!" }, 400)
        }

        const isAdmin = user.is_admin;
        const isOwner = booking.user_id === userId;

        if (!isAdmin && !isOwner) {
            return c.json({ message: "Forbidden, you have no right to be here!" }, 403)
        }


        const updateData: Partial<Booking> = c.req.valid("json");


        if (isOwner && (updateData.status && updateData.status !== 'cancelled')) {
            return c.json({ message: "You are not allowed to do this change" }, 400);
        }

        const response: PostgrestSingleResponse<Booking> = await sb.from("bookings").update(updateData).eq("id", id).select().single();

        const { data, error } = response;

        if (error) {
            console.error("Error updating booking:", error.code, error.message)
            if (error.message === 'Property already booked for these dates')
                return c.json({ message: "Property already booked for these dates" }, 400);
            return c.json({ message: "Oops something went wrong, try again" }, 400)
        }

        return c.json({ updatedBooking: data }, 200)
    } catch (error) {
        console.error("Error updating booking:", error)
        return c.json({ message: "Internal server error" }, 500)
    }
})


export default bookingApp;