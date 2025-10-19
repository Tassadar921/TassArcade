import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const loginValidator = zod.object({
    email: zod.email().max(100),
    password: zod.string().min(1),
});
