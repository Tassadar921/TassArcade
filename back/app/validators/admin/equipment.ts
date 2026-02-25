import vine from '@vinejs/vine';
import { sortByEquipmentRule } from '#validators/custom/equipment';

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
    english: vine.object({
        name: vine.string().trim().minLength(3).maxLength(50),
    }),
    french: vine.object({
        name: vine.string().trim().minLength(3).maxLength(50),
    }),
    thumbnail: vine.file({
        size: '2mb',
        extnames: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
    }),
});

export const getAdminEquipmentValidator = vine.create({
    id: vine.string().uuid(),
});
