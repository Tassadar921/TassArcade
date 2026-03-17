import vine from '@vinejs/vine';
import { sortByEquipmentRule } from '#validators/custom/equipment';
import { supportedLocales } from '#config/i18n';

const translationSchema = vine.object({
    languageCode: vine
        .string()
        .trim()
        .fixedLength(2)
        .in([...supportedLocales]),
    name: vine.string().trim().minLength(3).maxLength(50),
});

export const searchAdminEquipmentsValidator = vine.create({
    query: vine.string().trim().maxLength(50),
    page: vine.number().positive(),
    limit: vine.number().positive(),
    sortBy: vine.string().trim().use(sortByEquipmentRule()),
});

export const deleteEquipmentsValidator = vine.create({
    equipments: vine.array(vine.string().uuid()),
});

export const createOrUpdateEquipmentValidator = vine.create({
    category: vine.string().trim().minLength(3).maxLength(50),
    translations: vine.array(translationSchema).minLength(supportedLocales.length),
    thumbnail: vine.file({
        size: '2mb',
        extnames: ['svg'],
    }),
});

export const getAdminEquipmentValidator = vine.create({
    id: vine.string().uuid(),
});
