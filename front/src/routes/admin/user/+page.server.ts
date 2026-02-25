import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const response: Response = await fetch('/admin/user');

    const { isSuccess, users } = await response.json();

    return isSuccess && response.ok ? { isSuccess, users } : { isSuccess: false };
};
