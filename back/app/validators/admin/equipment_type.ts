import vine from '@vinejs/vine';
import { sortByEquipmentTypeRule } from '#validators/custom/equipment_type';
import { supportedLocales } from '#config/i18n';

const translationSchema = vine.object({
    code: vine
        .string()
        .trim()
        .fixedLength(2)
        .in([...supportedLocales]),
    name: vine.string().trim().minLength(3).maxLength(50),
});

export const searchAdminEquipmentTypesValidator = vine.create({
    query: vine.string().trim().maxLength(50),
    page: vine.number().positive(),
    limit: vine.number().positive(),
    sortBy: vine.string().trim().use(sortByEquipmentTypeRule()),
});

export const deleteEquipmentTypesValidator = vine.create({
    equipmentTypes: vine.array(vine.string().uuid()),
});

export const createOrUpdateEquipmentTypeValidator = vine.create({
    code: vine.string().trim().minLength(3).maxLength(50),
    equipmentId: vine.string().uuid(),
    translations: vine.array(translationSchema).minLength(supportedLocales.length),
});

export const getAdminEquipmentTypeValidator = vine.create({
    id: vine.string().uuid(),
});
