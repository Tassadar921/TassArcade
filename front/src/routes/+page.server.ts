import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const fallbackPosition: { lat: number; lon: number } = {
        lat: 48.866667,
        lon: 2.333333,
    }; // Paris

    const equipmentsResponse: Response = await fetch('/map/equipments');

    const { isSuccess, data } = await equipmentsResponse.json();

    if (isSuccess) {
        return { isSuccess: true, equipments: data, latitude: fallbackPosition.lat, longitude: fallbackPosition.lon };
    } else {
        return { isSuccess: false };
    }
};
