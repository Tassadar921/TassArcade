import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const profileValidator = zod.object({
    username: zod.string().min(3).max(50),
    email: zod.email().max(100),
    profilePicture: zod.file().mime(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']).max(2_000_000).optional(),
});
