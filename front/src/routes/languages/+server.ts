import { json, type RequestHandler } from '@sveltejs/kit';
import { m } from '#lib/paraglide/messages';

export const GET: RequestHandler = async ({ locals }): Promise<Response> => {
    try {
        const response = await locals.client.get('/api/languages/all');

        if (response.status < 200 || response.status >= 300) {
            throw response;
        }

        return json({
            isSuccess: true,
            languages: response.data,
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
