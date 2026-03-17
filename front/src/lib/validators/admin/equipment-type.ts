import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const adminEquipmentTypeValidator = zod.object({
    translations: zod.array(
        zod.object({
            name: zod.string().min(3, { error: m['admin.equipment-type.fields.name.error.min']() }).max(50, { error: m['admin.equipment.fields.name.error.max']() }),
            languageCode: zod.string().min(2, { error: m['admin.equipment-type.fields.language-code.error.length']() }).max(2, { error: m['admin.equipment.fields.language-code.error.length']() }),
        })
    ),
    code: zod.string().min(3, { error: m['admin.equipment-type.fields.code.error.min']() }).max(50, { error: m['admin.equipment.fields.category.error.max']() }),
});
