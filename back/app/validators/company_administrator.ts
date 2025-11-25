import vine from '@vinejs/vine';
import { sortByCompanyAdministratorRule } from '#validators/custom/company_administrator';
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
        sortBy: vine.string().trim().use(sortByCompanyAdministratorRule()),
    })
);

export const searchUsersValidator = vine.compile(
    vine.object({
        query: vine.string().trim().maxLength(50),
        page: vine.number().positive(),
        limit: vine.number().positive(),
        sortBy: vine.string().trim().use(sortByUserRule()),
    })
);

export const addAdministratorValidator = vine.compile(
    vine.object({
        userId: vine.string().uuid(),
    })
);

export const removeAdministratorValidator = vine.compile(
    vine.object({
        userId: vine.string().uuid(),
    })
);
