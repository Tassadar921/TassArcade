import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const response: Response = await fetch('/admin/equipment-type');

    const { isSuccess, equipmentTypes } = await response.json();

    return isSuccess && response.ok ? { isSuccess, equipmentTypes } : { isSuccess: false };
};
