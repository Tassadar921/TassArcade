import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const newCompanyValidator = zod.object({
    siret: zod
        .string()
        .length(14, { message: m['company.new.siret.error.length']() })
        .regex(/^[0-9]+$/, { message: m['company.new.siret.error.numeric']() }),
    name: zod.string().min(3, { message: m['company.new.name.error.min']() }).max(100, { message: m['company.new.name.error.max']() }),
    address: zod.string().min(5, { message: m['company.new.address.error.min']() }).max(100, { message: m['company.new.address.error.max']() }),
    postalCode: zod.string().min(5, { message: m['company.new.postal-code.error.length']() }).max(5, { message: m['company.new.postal-code.error.length']() }),
    city: zod.string().max(250, { message: m['company.new.city.error.max']() }),
    complement: zod.string().optional(),
    countryCode: zod
        .string()
        .min(2, { message: m['company.new.country.error.min']() })
        .max(2, { message: m['company.new.country.error.max']() })
        .uppercase({ message: m['company.new.country.error.uppercase']() }),
    email: zod.string().email({ message: m['company.new.email.error.invalid']() }).max(100, { message: m['company.new.email.error.max']() }).optional(),
    phoneNumber: zod
        .string()
        .regex(/^[0-9]+$/, { message: m['company.new.phone-number.error.numeric']() })
        .min(8, { message: m['company.new.phone-number.error.min']() })
        .max(50, { message: m['company.new.phone-number.error.max']() })
        .optional(),
});
