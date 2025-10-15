type PropertiesQuery = {
    offset?: number,
    limit?: number,
    sort_by?: "name" | "price_per_night" | "created_at",
    q?: string
}

type PaginatedListResponse<T> = {
    data: T[],
    offset: number,
    limit: number,
    count: number,

}