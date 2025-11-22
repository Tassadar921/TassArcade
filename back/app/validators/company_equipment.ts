import vine from '@vinejs/vine';
import { sortByCompanyEquipmentRule } from '#validators/custom/company_equipment';

export const getCompanyEquipmentsValidator = vine.compile(
    vine.object({
        companyId: vine.string().uuid(),
        query: vine.string().trim().maxLength(50).optional(),
        page: vine.number().positive().optional(),
        limit: vine.number().positive().optional(),
        sortBy: vine.string().trim().use(sortByCompanyEquipmentRule()).optional(),
    })
);
