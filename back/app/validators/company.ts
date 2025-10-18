import vine from '@vinejs/vine';

export const getFromSiretValidator = vine.compile(
    vine.object({
        siret: vine.string().fixedLength(14),
    })
);
