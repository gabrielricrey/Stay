interface NewBooking {
    property_id: string;
    user_id?: string;
    check_in_date: string;
    check_out_date: string;
    total_cost?: number;
}

interface Booking extends NewBooking {
    id: string;
    created_at: string;
    updated_at: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";

}

type BookingWithProperty = {
    booking: Booking,
    property: Property
}

