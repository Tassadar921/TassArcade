import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const newCompanyValidator = zod.object({
    siret: zod
        .string()
        .length(14, { error: m['company.new.siret.error.length']() })
        .regex(/^[0-9]+$/, { error: m['company.new.siret.error.numeric']() }),
    name: zod
        .string()
        .min(3, { error: m['company.new.name.error.min']({ min: 3 }) })
        .max(100, { error: m['company.new.name.error.max']({ max: 100 }) }),
    address: zod
        .string()
        .min(5, { error: m['company.new.address.error.min']({ min: 5 }) })
        .max(100, { error: m['company.new.address.error.max']({ max: 100 }) }),
    postalCode: zod
        .string()
        .min(3, { error: m['company.new.postal-code.error.min']({ min: 3 }) })
        .max(10, { error: m['company.new.postal-code.error.max']({ max: 10 }) }),
    city: zod.string().max(100, { error: m['company.new.city.error.max']({ max: 100 }) }),
    complement: zod
        .string()
        .max(255, { error: m['company.new.complement.error.max']({ max: 255 }) })
        .optional(),
    countryCode: zod
        .string()
        .min(2, { error: m['company.new.country.error.length']({ length: 2 }) })
        .max(2, { error: m['company.new.country.error.length']({ length: 2 }) })
        .uppercase({ error: m['company.new.country.error.uppercase']() }),
    email: zod.email({ error: m['common.email.error.invalid']() }).max(100, { error: m['common.email.error.max']() }).optional(),
    phoneNumber: zod
        .string()
        .regex(/^[0-9]+$/, { error: m['common.phone-number.error.numeric']() })
        .min(8, { error: m['common.phone-number.error.min']({ min: 8 }) })
        .max(50, { error: m['common.phone-number.error.max']({ min: 20 }) })
        .optional(),
});
