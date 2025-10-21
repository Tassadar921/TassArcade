import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const resetPasswordValidator = zod.object({
    email: zod.email().max(100),
});

export const confirmResetPasswordValidator = zod.object({
    password: zod
        .string()
        .min(8, { error: m['common.password.error.min']() })
        .max(100, { error: m['common.password.error.max']() })
        .refine((val: string): boolean => /[a-z]/.test(val), { message: m['common.password.error.lowercase']() })
        .refine((val: string): boolean => /[A-Z]/.test(val), { message: m['common.password.error.uppercase']() })
        .refine((val: string): boolean => /[0-9]/.test(val), { message: m['common.password.error.number']() })
        .refine((val: string): boolean => /[!@#$%^&*(),.?":{}|<>]/.test(val), { message: m['common.password.error.special']() }),
    confirmPassword: zod.string(),
});
