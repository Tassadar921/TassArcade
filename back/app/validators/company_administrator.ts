import vine from '@vinejs/vine';
import { sortByUserRule } from '#validators/custom/user';

export const companyIdValidator = vine.compile(
    vine.object({
        companyId: vine.string().uuid(),
    })
);

export const searchCompanyAdministratorsValidator = vine.compile(
    vine.object({
        query: vine.string().trim().maxLength(50),
        page: vine.number().positive(),
        limit: vine.number().positive(),
        sortBy: vine.string().trim().use(sortByUserRule()),
    })
);
