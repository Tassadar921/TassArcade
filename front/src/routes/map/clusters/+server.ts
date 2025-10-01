import { json, type RequestHandler } from '@sveltejs/kit';
import { m } from '#lib/paraglide/messages';

export const GET: RequestHandler = async ({ url, locals }): Promise<Response> => {
    const params = Object.fromEntries(url.searchParams);

    try {
        const response = await locals.client.get(`/api/clusters?minLat=${params.minLat}&maxLat=${params.maxLat}&minLng=${params.minLng}&maxLng=${params.maxLng}&zoom=${params.zoom}`);

        if (response.status !== 200) {
            throw response;
        }

        return json({
            isSuccess: true,
            data: response.data,
        });
    } catch (error: any) {
        return json(
            {
                isSuccess: false,
                message: error?.response?.data?.error || m['common.error.default-message'](),
            },
            { status: error?.response?.status || 500 }
        );
    }
};
