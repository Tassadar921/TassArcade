import vine from '@vinejs/vine';
import { sortByUserRule } from '#validators/custom/user';

export const getCompanyAdministratorsValidator = vine.compile(
    vine.object({
        companyId: vine.string().uuid(),
        query: vine.string().trim().maxLength(50).optional(),
        page: vine.number().positive().optional(),
        limit: vine.number().positive().optional(),
        sortBy: vine.string().trim().use(sortByUserRule()).optional(),
    })
);
