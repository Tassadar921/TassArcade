import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const adminEquipmentValidator = zod.object({
    translations: zod.array(
        zod.object({
            name: zod.string().min(3, { error: m['admin.equipment.fields.name.error.min']() }).max(50, { error: m['admin.equipment.fields.name.error.max']() }),
            languageCode: zod.string().min(2, { error: m['admin.equipment.fields.language-code.error.length']() }).max(2, { error: m['admin.equipment.fields.language-code.error.length']() }),
        })
    ),
    category: zod.string().min(3, { error: m['admin.equipment.fields.category.error.min']() }).max(50, { error: m['admin.equipment.fields.category.error.max']() }),
    thumbnail: zod.file().mime(['image/svg+xml']).max(2_000_000),
});
