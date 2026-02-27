import { type Actions, fail, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { extractFormData, extractFormErrors } from '#lib/services/requestService';
import type { FormError } from '../../../../app';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const response: Response = await fetch('/languages');

    console.log('là');
    const { isSuccess, languages } = await response.json();
    console.log('ici');

    return isSuccess && response.ok ? { isSuccess, languages } : { isSuccess: false };
};

export const actions: Actions = {
    default: async (event: RequestEvent): Promise<void> => {
        const { request, cookies, locals } = event;

        const formData: FormData = await request.formData();

        let data: any;
        let isSuccess: boolean = true;

        try {
            const response = await locals.client.post('/api/admin/equipment/create', formData, {
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
                303,
                `/${cookies.get('PARAGLIDE_LOCALE')}/admin/equipment/edit/${data.equipment.id}`,
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
