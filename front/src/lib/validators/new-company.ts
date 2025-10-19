import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const newCompanyValidator = zod.object({
    siret: zod
        .string()
        .length(14, { error: m['company.new.siret.error.length']() })
        .regex(/^[0-9]+$/, { error: m['company.new.siret.error.numeric']() }),
    name: zod.string().min(3, { error: m['company.new.name.error.min']() }).max(100, { error: m['company.new.name.error.max']() }),
    address: zod.string().min(5, { error: m['company.new.address.error.min']() }).max(100, { error: m['company.new.address.error.max']() }),
    postalCode: zod.string().min(5, { error: m['company.new.postal-code.error.length']() }).max(5, { error: m['company.new.postal-code.error.length']() }),
    city: zod.string().max(250, { error: m['company.new.city.error.max']() }),
    complement: zod.string().optional(),
    countryCode: zod
        .string()
        .min(2, { error: m['company.new.country.error.min']() })
        .max(2, { error: m['company.new.country.error.max']() })
        .uppercase({ error: m['company.new.country.error.uppercase']() }),
    email: zod.email({ error: m['common.email.error.invalid']() }).max(100, { error: m['common.email.error.max']() }).optional(),
    phoneNumber: zod
        .string()
        .regex(/^[0-9]+$/, { error: m['common.phone-number.error.numeric']() })
        .min(8, { error: m['common.phone-number.error.min']() })
        .max(50, { error: m['common.phone-number.error.max']() })
        .optional(),
});
