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

interface BookingWithProfile extends Booking {
    user_profiles: {
        first_name: string;
    };
}

interface BookingWithProperty extends Booking {
    properties: Pick<Property, 'name' | 'image_url'>
}

interface BookingWithUserAndProperty extends BookingWithProfile {

    property_name: string;
    property_image: string | null;
}

