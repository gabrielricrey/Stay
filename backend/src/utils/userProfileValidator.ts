import * as z from 'zod';
import { zValidator } from '@hono/zod-validator';


const userProfileSchema: z.ZodType<NewUserProfile> = z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    avatar_url: z.string().default(''),
});

export const userProfileValidator = zValidator('json', userProfileSchema);
