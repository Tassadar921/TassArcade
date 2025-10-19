import { type Actions, fail, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import type { FormError } from '../../app';
import { extractFormData, extractFormErrors } from '#lib/services/requestService';

export const actions: Actions = {
    default: async (event: RequestEvent): Promise<void> => {
        const { request, cookies, locals } = event;

        const formData: FormData = await request.formData();

        let data: any;
        let isSuccess: boolean = true;

        try {
            const confirmPassword: FormDataEntryValue | null = formData.get('confirm-password');
            const postalCode: FormDataEntryValue | null = formData.get('postal-code');
            if (!confirmPassword || !postalCode) {
                throw 'Missing variable';
            }

            formData.append('confirmPassword', confirmPassword);
            formData.delete('confirm-password');

            formData.append('postalCode', postalCode);
            formData.delete('postal-code');

            const response = await locals.client.post('/api/account-creation/send-mail', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status < 200 || response.status >= 300) {
                throw response;
            }

            data = response.data;
        } catch (error: any) {
            isSuccess = false;
            data = error?.response?.data;
        }

        if (isSuccess) {
            redirect(
                {
                    type: 'success',
                    message: data?.message,
                },
                event
            );
        } else {
            const form: FormError = {
                data: extractFormData(formData),
                errors: extractFormErrors(data),
            };

            cookies.set('formError', JSON.stringify(form), {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
            });

            fail(400);
        }
    },
};
