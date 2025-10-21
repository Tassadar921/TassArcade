import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const adminUserValidator = zod.object({
    username: zod.string().min(3, { error: m['common.username.error.min']() }).max(50, { error: m['common.username.error.max']() }),
    email: zod.email({ error: m['common.email.error.invalid']() }).max(100, { error: m['common.email.error.max']() }),
    enabled: zod.boolean(),
    profilePicture: zod.file().mime(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']).max(2_000_000).optional(),
});
