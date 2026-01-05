import vine from '@vinejs/vine';

export const confirmOauthConnectionValidator = vine.create({
    provider: vine.string().trim(),
    token: vine.string().trim(),
});
