import { m } from '#lib/paraglide/messages';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { type Actions, fail, type RequestEvent } from '@sveltejs/kit';
import type { FormError } from '../../../../../app';
import { extractFormData, extractFormErrors } from '#lib/services/requestService';

export const load: PageServerLoad = async (event) => {
    const { locals, params, cookies } = event;
    try {
        const response = await locals.client.get(`/api/profile/company/${params.id}`);

        if (response.status < 200 || response.status >= 300) {
            throw response;
        }

        const headers = {
            title: m['company.edit.title']({ name: response.data.company.name }),
            meta: {
                title: m['company.edit.meta.title']({ name: response.data.company.name }),
                description: m['company.edit.meta.description'](),
                pathname: `/profile/companies/edit/${response.data.company.id}`,
            },
            breadcrumb: [
                { title: m['profile.title'](), href: '/profile' },
                { title: m['profile.companies.title'](), href: '/profile/companies' },
                { title: m['company.edit.title']({ name: response.data.company.name }) },
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
            `/${cookies.get('PARAGLIDE_LOCALE')}/profile/companies`,
            {
                type: 'error',
                message: error?.response?.data?.error ?? m['common.error.default-message'](),
            },
            event
        );
    }
};

export const actions: Actions = {
    confirm: async (event: RequestEvent): Promise<void> => {
        const { request, cookies, locals, params } = event;

        const formData: FormData = await request.formData();

        let data: any;
        let isSuccess: boolean = true;

        try {
            const companyId: string | undefined = params.id;
            if (!companyId) {
                throw 'Missing variable';
            }

            formData.append('companyId', companyId);

            const response = await locals.client.post('/api/profile/company/confirm', formData, {
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
    update: async (event: RequestEvent): Promise<void> => {
        const { request, cookies, locals, params } = event;

        const formData: FormData = await request.formData();

        let data: any;
        let isSuccess: boolean = true;

        try {
            const companyId: string | undefined = params.id;
            if (!companyId) {
                throw 'Missing variable';
            }

            formData.append('companyId', companyId);

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
