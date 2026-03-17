import vine from '@vinejs/vine';

export const serveStaticProfilePictureFileValidator = vine.create({
    userId: vine.string().uuid(),
});

export const serveStaticEquipmentThumbnailFileValidator = vine.create({
    equipmentId: vine.string().uuid(),
});

export const serveStaticCompanyLogoFileValidator = vine.create({
    companyId: vine.string().uuid(),
});

export const serveStaticLanguageFlagFileValidator = vine.create({
    languageId: vine.string().uuid(),
});
