import vine from '@vinejs/vine';
import { sortByCompanyEquipmentTypeRule } from '#validators/custom/company_equipment';

export const companyIdValidator = vine.create({
    companyId: vine.string().uuid(),
});

export const getCompanyEquipmentsValidator = vine.create({
    query: vine.string().trim().maxLength(50),
    page: vine.number().positive(),
    limit: vine.number().positive(),
    sortBy: vine.string().trim().use(sortByCompanyEquipmentTypeRule()),
});

export const createOrUpdateEquipmentValidator = vine.create({
    companyEquipmentTypeId: vine.string().uuid().optional(),
    equipmentTypeId: vine.string().uuid(),
    name: vine.string().optional(),
    description: vine.string().optional(),
});

export const removeEquipmentValidator = vine.create({
    equipmentIds: vine.array(vine.string().uuid()),
});
