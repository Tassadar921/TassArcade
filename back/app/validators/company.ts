import vine from '@vinejs/vine';

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
        email: vine.string().trim().email().maxLength(100),
        phoneNumber: vine.string().trim().minLength(8).maxLength(20),
    })
);
