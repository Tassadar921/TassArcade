import { json, type RequestHandler } from '@sveltejs/kit';
import { m } from '#lib/paraglide/messages';

export const GET: RequestHandler = async ({ locals }): Promise<Response> => {
    try {
        const response = await locals.client.get('/api/equipments');

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
                message: error?.response?.data?.error || m['common.error.default-message'](),
            },
            { status: error?.response?.status || 500 }
        );
    }
};
