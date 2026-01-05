import vine from '@vinejs/vine';
import { sortByCompanyRule } from '#validators/custom/company';

export const getCompanyFromSiretValidator = vine.create({
    siret: vine.string().fixedLength(14),
});

export const createCompanyValidator = vine.create({
    siret: vine.string().fixedLength(14),
    name: vine.string().trim().minLength(3).maxLength(100),
    address: vine.string().trim().minLength(5).maxLength(100),
    postalCode: vine.string().trim().minLength(3).maxLength(10),
    city: vine.string().trim().maxLength(100),
    complement: vine.string().trim().maxLength(255).optional(),
    countryCode: vine.string().trim().fixedLength(2),
    email: vine.string().trim().email().maxLength(100).optional(),
    phoneNumber: vine.string().trim().minLength(8).maxLength(20).optional(),
    logo: vine
        .file({
            size: '2mb',
            extnames: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
        })
        .optional(),
});

export const searchCompaniesValidator = vine.create({
    query: vine.string().trim().maxLength(50),
    page: vine.number().positive(),
    limit: vine.number().positive(),
    sortBy: vine.string().trim().use(sortByCompanyRule()),
});

export const deleteCompanyValidator = vine.create({
    companyId: vine.string().uuid(),
});

export const getCompanyValidator = vine.create({
    companyId: vine.string().uuid(),
});

export const updateCompanyValidator = vine.create({
    companyId: vine.string().uuid(),
    siret: vine.string().fixedLength(14),
    name: vine.string().trim().minLength(3).maxLength(100),
    address: vine.string().trim().minLength(5).maxLength(100),
    postalCode: vine.string().trim().minLength(3).maxLength(10),
    city: vine.string().trim().maxLength(100),
    complement: vine.string().trim().maxLength(255).optional(),
    countryCode: vine.string().trim().fixedLength(2),
    email: vine.string().trim().email().maxLength(100).optional(),
    phoneNumber: vine.string().trim().minLength(8).maxLength(20).optional(),
    logo: vine
        .file({
            size: '2mb',
            extnames: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
        })
        .optional(),
});

export const confirmCompanyValidator = vine.create({
    companyId: vine.string().uuid(),
    document: vine.file({
        size: '5mb',
        extnames: ['png', 'jpg', 'jpeg', 'pdf'],
    }),
});
