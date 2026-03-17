import vine from '@vinejs/vine';

export const loginValidator = vine.create({
    email: vine.string().trim().email().maxLength(100),
    password: vine.string().trim(),
});

export const sendAccountCreationEmailValidator = vine.create({
    username: vine.string().trim().minLength(3).maxLength(50),
    email: vine.string().trim().email(),
    password: vine
        .string()
        .trim()
        .minLength(8)
        .maxLength(100)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
        .confirmed({ confirmationField: 'confirmPassword' }),
    consent: vine.boolean(),
});

export const confirmAccountCreationValidator = vine.create({
    token: vine.string().trim(),
});
