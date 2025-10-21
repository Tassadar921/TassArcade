import type { PageServerLoad } from './$types';
import { type Actions, fail, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import type { FormError } from '../../../app';
import { extractFormData, extractFormErrors } from '#lib/services/requestService';

export const load: PageServerLoad = async ({ fetch }) => {
    const response: Response = await fetch('/countries');

    const { isSuccess, data } = await response.json();

    return isSuccess && response.ok ? { isSuccess, data } : { isSuccess: false, message: data.message };
};

export const actions: Actions = {
    default: async (event: RequestEvent): Promise<void> => {
        const { request, cookies, locals } = event;

        const formData: FormData = await request.formData();

        let data: any;
        let isSuccess: boolean = true;

        try {
            const postalCode: FormDataEntryValue | null = formData.get('postal-code');
            const countryCode: FormDataEntryValue | null = formData.get('country-code');
            if (!postalCode || !countryCode) {
                throw 'Missing variable';
            }

            formData.append('postalCode', postalCode);
            formData.delete('postal-code');

            formData.append('countryCode', countryCode);
            formData.delete('country-code');

            const phoneNumber: FormDataEntryValue | null = formData.get('phone-number');
            if (phoneNumber) {
                formData.append('phoneNumber', phoneNumber);
                formData.delete('phone-number');
            }

            const response = await locals.client.post('/api/company/new', formData, {
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
