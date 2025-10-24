import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const response: Response = await fetch('/profile/companies');

    const { isSuccess, data } = await response.json();

    return isSuccess && response.ok ? { isSuccess, data } : { isSuccess: false };
};
