import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { m } from '#lib/paraglide/messages';

export const POST: RequestHandler = async ({ request, locals, params }): Promise<Response> => {
    const body = await request.json();
    try {
        const response = await locals.client.post(`/api/profile/company/${params.id}/administrators/add`, {
            userId: body.userId,
        });

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
