interface NewUserProfile {
    first_name: string,
    last_name: string,
    avatar_url: string,
}

interface UserProfile extends NewUserProfile {
    id: string,
    created_at: string
    updated_at: string,
    is_admin: boolean,
}