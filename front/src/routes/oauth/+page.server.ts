import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { m } from '#lib/paraglide/messages';

export const load: PageServerLoad = async (event): Promise<never> => {
    const { url, cookies, locals } = event;
    const provider: string | null = url.searchParams.get('provider');
    const token: string | null = url.searchParams.get('token');

    let data: any;
    let isSuccess: boolean = true;

    try {
        const response = await locals.client.post(`api/auth/confirm/${provider}/${token}`);

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

        cookies.set('token', data.token.token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });

        const previousPathName: string | undefined = cookies.get('previousPathName');
        cookies.delete('previousPathName', { path: '/' });
        redirect(
            303,
            `/${cookies.get('PARAGLIDE_LOCALE')}${previousPathName ? `/${previousPathName}` : ''}`,
            {
                type: 'success',
                message: data?.message,
            },
            event
        );
    } else {
        redirect(
            `/${cookies.get('PARAGLIDE_LOCALE')}/login`,
            {
                type: 'error',
                message: data?.error ?? m['common.error.default-message'](),
            },
            event
        );
    }
};
