import { type Actions, fail, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import type { FormError } from '../../app';
import { extractFormData, extractFormErrors } from '#lib/services/requestService';
import type { PageServerLoad } from './$types';
import { m } from '#lib/paraglide/messages';

export const load: PageServerLoad = async () => {
    const headers = {
        title: m['profile.title'](),
        meta: {
            title: m['profile.meta.title'](),
            description: m['profile.meta.description'](),
            pathname: '/profile',
        },
        breadcrumb: [{ title: m['profile.title']() }],
    };

    return { ...headers };
};

export const actions: Actions = {
    default: async (event: RequestEvent): Promise<void> => {
        const { request, cookies, locals } = event;

        const formData: FormData = await request.formData();

        let data: any;
        let isSuccess: boolean = true;

        try {
            const response = await locals.client.post('/api/profile/update', formData, {
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
            cookies.set('user', JSON.stringify(data.user), {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
            });

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
