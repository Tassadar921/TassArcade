import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';
import { optionalFormString } from '#lib/services/formService';

export const companyEquipmentTypeValidator = zod.object({
    name: optionalFormString(
        zod
            .string()
            .min(3, { error: m['company.edit.equipments.fields.name.error.min']({ min: 3 }) })
            .max(100, { error: m['company.edit.equipments.fields.name.error.max']({ max: 100 }) })
    ),
    description: optionalFormString(
        zod
            .string()
            .min(3, { error: m['company.edit.equipments.fields.description.error.min']({ min: 3 }) })
            .max(100, { error: m['company.edit.equipments.fields.description.error.max']({ max: 100 }) })
    ),
});
