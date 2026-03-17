import * as zod from 'zod';
import { m } from '#lib/paraglide/messages';

export const confirmCompanyValidator = zod.object({
    document: zod
        .instanceof(File, { message: m['company.edit.confirm.file-upload.error.type']() })
        .refine(
            (file: File): boolean => {
                const mimeOk: boolean = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
                const extOk: boolean = /\.(pdf|jpe?g|png)$/i.test(file.name);
                return mimeOk || extOk;
            },
            {
                message: m['company.edit.confirm.file-upload.error.type'](),
            }
        )
        .refine((file: File): boolean => file.size <= 5 * 1024 * 1024, {
            message: m['company.edit.confirm.file-upload.error.size'](),
        }),
});
