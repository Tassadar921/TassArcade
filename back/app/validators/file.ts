import vine from '@vinejs/vine';

export const serveStaticProfilePictureFileValidator = vine.compile(
    vine.object({
        userId: vine.string().uuid(),
    })
);

export const serveStaticEquipmentThumbnailFileValidator = vine.compile(
    vine.object({
        equipmentId: vine.string().uuid(),
    })
);

export const serveStaticCompanyLogoFileValidator = vine.compile(
    vine.object({
        companyId: vine.string().uuid(),
    })
);
