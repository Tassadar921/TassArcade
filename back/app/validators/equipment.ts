import vine from '@vinejs/vine';
import { sortByEquipmentTypeRule } from '#validators/custom/equipment_type';

export const searchEquipmentsValidator = vine.create({
    query: vine.string().trim().maxLength(50),
    page: vine.number().positive(),
    limit: vine.number().positive(),
    sortBy: vine.string().trim().use(sortByEquipmentTypeRule()),
});
