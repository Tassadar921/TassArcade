import vine from '@vinejs/vine';
import { sortByEquipmentRule } from '#validators/custom/equipment';

export const searchEquipmentsValidator = vine.compile(
    vine.object({
        query: vine.string().trim().maxLength(50),
        page: vine.number().positive(),
        limit: vine.number().positive(),
        sortBy: vine.string().trim().use(sortByEquipmentRule()),
    })
);
