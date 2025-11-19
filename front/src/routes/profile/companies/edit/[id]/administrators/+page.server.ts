import { m } from '#lib/paraglide/messages';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { type Actions, fail, type RequestEvent } from '@sveltejs/kit';
import { extractFormData, extractFormErrors } from '#lib/services/requestService';
import type { FormError } from '../../../../../../app';

export const load: PageServerLoad = async (event) => {
    const { locals, params, cookies } = event;
    try {
        const response = await locals.client.get(`/api/profile/companies/edit/${params.id}/administrators`);

        if (response.status < 200 || response.status >= 300) {
            throw response;
        }

        const headers = {
            title: m['company.edit.administrators.title'](),
            meta: {
                title: m['company.edit.administrators.meta.title'](),
                description: m['company.edit.administrators.meta.description'](),
                pathname: `/profile/companies/edit/${params.id}/administrators`,
            },
            breadcrumb: [
                { title: m['profile.title'](), href: '/profile' },
                { title: m['profile.companies.title'](), href: '/profile/companies' },
                { title: m['company.edit.title']({ name: response.data.company.name }), href: `/profile/companies/edit/${params.id}` },
                { title: m['company.edit.administrators.title']() },
            ],
        };

        return {
            isSuccess: true,
            company: response.data.company,
            countries: response.data.countries,
            ...headers,
        };
    } catch (error: any) {
        redirect(
            `/${cookies.get('PARAGLIDE_LOCALE')}/profile/companies/edit/${params.id}`,
            {
                type: 'error',
                message: error?.response?.data?.error ?? m['common.error.default-message'](),
            },
            event
        );
    }
};

export const actions: Actions = {
    default: async (event: RequestEvent): Promise<void> => {
        const { request, cookies, locals, params } = event;

        const formData: FormData = await request.formData();

        let data: any;
        let isSuccess: boolean = true;

        try {
            const response = await locals.client.post('/api/profile/company/update', formData, {
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
