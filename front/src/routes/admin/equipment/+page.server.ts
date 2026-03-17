import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const response: Response = await fetch('/admin/equipment');

    const { isSuccess, equipments } = await response.json();

    return isSuccess && response.ok ? { isSuccess, equipments } : { isSuccess: false };
};
