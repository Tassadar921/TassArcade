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
            const phoneNumber: FormDataEntryValue | null = formData.get('phone-number');
            if (!phoneNumber) {
                throw 'Missing variable';
            }

            formData.append('phoneNumber', phoneNumber);
            formData.delete('phone-number');

            const { data: returnedData } = await locals.client.post('/api/company/new', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            data = returnedData;
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
