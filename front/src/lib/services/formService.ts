import * as z from 'zod';

export const optionalFormString = (schema: z.ZodString) =>
    z.preprocess((value) => {
        if (typeof value !== 'string') {
            return value;
        }

        let trimmed: string = value.trim();

        return trimmed === '' ? undefined : trimmed;
    }, schema.optional());
