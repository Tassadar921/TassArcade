import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const createAccountValidator = zod.object({
    username: zod.string().min(3, { error: m['common.username.error.min']() }).max(50, { error: m['common.username.error.max']() }),
    email: zod.email({ error: m['common.email.error.invalid']() }).max(100, { error: m['common.email.error.max']() }),
    password: zod
        .string()
        .min(8, { error: m['common.password.error.min']() })
        .max(100, { error: m['common.password.error.max']() })
        .refine((val: string): boolean => /[a-z]/.test(val), { message: m['common.password.error.lowercase']() })
        .refine((val: string): boolean => /[A-Z]/.test(val), { message: m['common.password.error.uppercase']() })
        .refine((val: string): boolean => /[0-9]/.test(val), { message: m['common.password.error.number']() })
        .refine((val: string): boolean => /[!@#$%^&*(),.?":{}|<>]/.test(val), { message: m['common.password.error.special']() }),
    confirmPassword: zod.string(),
    consent: zod.literal(true),
});
