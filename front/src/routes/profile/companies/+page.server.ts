import type { PageServerLoad } from './$types';
import { m } from '#lib/paraglide/messages';

export const load: PageServerLoad = async ({ fetch }) => {
    const response: Response = await fetch('/profile/companies');

    const headers = {
        title: m['profile.companies.title'](),
        meta: {
            title: m['profile.companies.meta.title'](),
            description: m['profile.companies.meta.description'](),
            pathname: '/profile/companies',
        },
        breadcrumb: [{ title: m['profile.title'](), href: '/profile' }, { title: m['profile.companies.title']() }],
    };

    const { isSuccess, data } = await response.json();

    return isSuccess && response.ok ? { isSuccess, companies: data, ...headers } : { isSuccess: false, ...headers };
};
