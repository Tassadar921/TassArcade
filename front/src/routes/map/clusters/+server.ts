import { json, type RequestHandler } from '@sveltejs/kit';
import { m } from '#lib/paraglide/messages';

export const POST: RequestHandler = async ({ request, url, locals }): Promise<Response> => {
    const params = Object.fromEntries(url.searchParams);
    const body = await request.json();

    try {
        const response = await locals.client.post(
            `/api/clusters?minLat=${params.minLat}&maxLat=${params.maxLat}&minLng=${params.minLng}&maxLng=${params.maxLng}&zoom=${params.zoom}${params.company ? `&company=${params.company}` : ''}`,
            body
        );

        if (response.status < 200 || response.status >= 300) {
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
                message: error?.response?.data?.error || error?.response?.data?.errors[0].message || m['common.error.default-message'](),
            },
            { status: error?.response?.status || 500 }
        );
    }
};
