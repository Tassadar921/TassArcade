import vine from '@vinejs/vine';
import { sortByCompanyAdministratorRule } from '#validators/custom/company_administrator';
import { sortByUserRule } from '#validators/custom/user';

export const companyIdValidator = vine.create({
    companyId: vine.string().uuid(),
});

export const searchCompanyAdministratorsValidator = vine.create({
    query: vine.string().trim().maxLength(50),
    page: vine.number().positive(),
    limit: vine.number().positive(),
    sortBy: vine.string().trim().use(sortByCompanyAdministratorRule()),
});

export const searchUsersValidator = vine.create({
    query: vine.string().trim().maxLength(50),
    page: vine.number().positive(),
    limit: vine.number().positive(),
    sortBy: vine.string().trim().use(sortByUserRule()),
});

export const addAdministratorValidator = vine.create({
    userId: vine.string().uuid(),
});

export const removeAdministratorValidator = vine.create({
    userId: vine.string().uuid(),
});
