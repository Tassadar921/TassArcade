import vine from '@vinejs/vine';
import { sortByCompanyEquipmentRule } from '#validators/custom/company_equipment';

export const companyIdValidator = vine.create({
    companyId: vine.string().uuid(),
});

export const searchCompanyEquipmentsValidator = vine.create({
    query: vine.string().trim().maxLength(50),
    page: vine.number().positive(),
    limit: vine.number().positive(),
});

export const getCompanyEquipmentsValidator = vine.create({
    companyId: vine.string().uuid(),
    query: vine.string().trim().maxLength(50).optional(),
    page: vine.number().positive().optional(),
    limit: vine.number().positive().optional(),
    sortBy: vine.string().trim().use(sortByCompanyEquipmentRule()).optional(),
});

export const createOrUpdateEquipmentValidator = vine.create({
    companyEquipmentTypeId: vine.string().uuid().optional(),
    equipmentTypeId: vine.string().uuid(),
    name: vine.string().optional(),
    description: vine.string().optional(),
});

export const removeEquipmentValidator = vine.create({
    equipmentId: vine.string().uuid(),
});
