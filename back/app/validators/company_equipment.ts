import vine from '@vinejs/vine';
import { sortByCompanyEquipmentRule } from '#validators/custom/company_equipment';
import { sortByEquipmentRule } from '#validators/custom/equipment';

export const companyIdValidator = vine.compile(
    vine.object({
        companyId: vine.string().uuid(),
    })
);

export const searchCompanyEquipmentsValidator = vine.compile(
    vine.object({
        query: vine.string().trim().maxLength(50),
        page: vine.number().positive(),
        limit: vine.number().positive(),
        sortBy: vine.string().trim().use(sortByCompanyEquipmentRule()),
    })
);

export const getCompanyEquipmentsValidator = vine.compile(
    vine.object({
        companyId: vine.string().uuid(),
        query: vine.string().trim().maxLength(50).optional(),
        page: vine.number().positive().optional(),
        limit: vine.number().positive().optional(),
        sortBy: vine.string().trim().use(sortByCompanyEquipmentRule()).optional(),
    })
);

export const createOrUpdateEquipmentValidator = vine.compile(
    vine.object({
        equipmentId: vine.string().uuid(),
        name: vine
            .object({
                en: vine.string().maxLength(255).optional(),
                fr: vine.string().maxLength(255).optional(),
            })
            .optional(),
        description: vine
            .object({
                en: vine.string().maxLength(1024).optional(),
                fr: vine.string().maxLength(1024).optional(),
            })
            .optional(),
    })
);

export const removeEquipmentValidator = vine.compile(
    vine.object({
        equipmentId: vine.string().uuid(),
    })
);
