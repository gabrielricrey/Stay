import * as z from 'zod';
import { zValidator } from '@hono/zod-validator';


const userProfileSchema: z.ZodType<NewUserProfile> = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    avatar_url: z.string().default(''),
    is_host: z.boolean().default(false).optional()
});

const updateUserProfileSchema: z.ZodType<Partial<UserProfile>> = z.object({
    first_name: z.string().min(2).max(100).optional(),
    last_name: z.string().min(2).max(100).optional(),
    avatar_url: z.string().default('').optional(),
    is_host: z.boolean().optional()
});

export const userProfileValidator = zValidator('json', userProfileSchema);
export const updateUserProfileValidator = zValidator('json', updateUserProfileSchema);
