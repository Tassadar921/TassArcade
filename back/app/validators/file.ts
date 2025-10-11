import vine from '@vinejs/vine';

export const serveStaticProfilePictureFileValidator = vine.compile(
    vine.object({
        userId: vine.string().uuid(),
    })
);

export const serveStaticLanguageFlagFileValidator = vine.compile(
    vine.object({
        languageCode: vine.string().fixedLength(2).toLowerCase(),
    })
);

export const serveStaticEquipmentThumbnailFileValidator = vine.compile(
    vine.object({
        equipmentId: vine.string().uuid(),
    })
);
