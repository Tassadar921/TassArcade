import vine from '@vinejs/vine';

export const searchEquipmentsValidator = vine.compile(
    vine.object({
        query: vine.string().trim().maxLength(50),
        page: vine.number().positive(),
        limit: vine.number().positive(),
    })
);
