interface NewProperty {
    name: string,
    description?: string,
    price_per_night: number,
    user_id: string,
    is_available?: boolean,
    image_url: string,
}

interface Property extends NewProperty {
    id: string,
    created_at: string,
    updated_at: string,
}

type PropertyWithBookings = {
    id: string,
    name: string,
    bookings: Booking[]
}
