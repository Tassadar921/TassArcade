import { loadFlash, redirect } from 'sveltekit-flash-message/server';
import type { LayoutServerLoad } from './$types';
import type { SerializedUser } from 'backend/types';
import { type LanguageCode } from '#lib/stores/languageStore';
import { locales } from '../paraglide/runtime';
import type { FormError } from '../app';

interface ProtectedPath {
    pathname: string;
}

export const load: LayoutServerLoad = loadFlash(async (event): Promise<{ user?: SerializedUser; language: LanguageCode; location: string; formError?: FormError }> => {
    const { cookies, url, locals } = event;

    // Paths that require authentication
    const protectedPaths: ProtectedPath[] = [{ pathname: '/profile' }, { pathname: '/admin' }];

    const match: RegExpMatchArray | null = url.pathname.match(/^\/([a-z]{2})(\/|$)/);
    const language: LanguageCode | undefined = match ? (match[1] as LanguageCode) : undefined;

    if (!language || !locales.includes(language)) {
        return redirect(307, `/${cookies.get('PARAGLIDE_LOCALE') ?? 'en'}${url.pathname}${url.search}`);
    }

    if (language !== cookies.get('PARAGLIDE_LOCALE')) {
        cookies.set('PARAGLIDE_LOCALE', language, {
            path: '/',
            httpOnly: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
        });
    }

    const userCookie: string | undefined = cookies.get('user');
    const user: SerializedUser | undefined = userCookie ? <SerializedUser>JSON.parse(userCookie) : undefined;

    const location: string = url.pathname.replace(`/${language}`, '') || '/';

    const formError: string | undefined = cookies.get('formError');

    // Check if current path is protected
    const requiresAuth: boolean = protectedPaths.some((protectedPath: ProtectedPath): boolean => location.startsWith(protectedPath.pathname));

    if (requiresAuth && !userCookie) {
        cookies.set('previousPathName', `${location}${url.search}`, {
            path: '/',
            httpOnly: false,
            sameSite: 'lax',
            maxAge: 60 * 60,
        });

        redirect(303, `/${language}/login`);
    }

    // Verify token if present
    if (userCookie && cookies.get('token')) {
        try {
            const response = await locals.client.get('/api');
            if (response.status !== 200) {
                throw response;
            }
        } catch {
            cookies.delete('user', { path: '/' });
            cookies.delete('token', { path: '/' });
            redirect(303, `/${language}/login`);
        }
    }

    let formErrorParsed: FormError | undefined;
    if (formError) {
        cookies.delete('formError', { path: '/' });
        formErrorParsed = JSON.parse(formError);
    }

    return {
        user,
        language,
        location,
        formError: formErrorParsed,
    };
});
