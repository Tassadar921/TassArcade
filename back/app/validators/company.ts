import vine from '@vinejs/vine';
import { sortByCompanyRule } from '#validators/custom/company';

export const getCompanyFromSiretValidator = vine.compile(
    vine.object({
        siret: vine.string().fixedLength(14),
    })
);

export const createCompanyValidator = vine.compile(
    vine.object({
        siret: vine.string().fixedLength(14),
        name: vine.string().trim().minLength(3).maxLength(100),
        address: vine.string().trim().minLength(5).maxLength(100),
        postalCode: vine.string().trim().minLength(3).maxLength(10),
        city: vine.string().trim().maxLength(100),
        complement: vine.string().trim().maxLength(255).optional(),
        countryCode: vine.string().trim().fixedLength(2),
        email: vine.string().trim().email().maxLength(100).optional(),
        phoneNumber: vine.string().trim().minLength(8).maxLength(20).optional(),
    })
);

export const searchCompaniesValidator = vine.compile(
    vine.object({
        query: vine.string().trim().maxLength(50),
        page: vine.number().positive(),
        limit: vine.number().positive(),
        sortBy: vine.string().trim().use(sortByCompanyRule()),
    })
);

export const deleteCompaniesValidator = vine.compile(
    vine.object({
        companies: vine.array(vine.string().uuid()),
    })
);

export const getCompanyValidator = vine.compile(
    vine.object({
        siret: vine.string().fixedLength(14),
    })
);

export const updateCompanyValidator = vine.compile(
    vine.object({
        siret: vine.string().fixedLength(14),
        name: vine.string().trim().minLength(3).maxLength(100),
        address: vine.string().trim().minLength(5).maxLength(100),
        postalCode: vine.string().trim().minLength(3).maxLength(10),
        city: vine.string().trim().maxLength(100),
        complement: vine.string().trim().maxLength(255).optional(),
        countryCode: vine.string().trim().fixedLength(2),
        email: vine.string().trim().email().maxLength(100).optional(),
        phoneNumber: vine.string().trim().minLength(8).maxLength(20).optional(),
    })
);
