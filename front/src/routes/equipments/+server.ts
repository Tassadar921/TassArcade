import { json, type RequestHandler } from '@sveltejs/kit';
import { m } from '#lib/paraglide/messages';

export const GET: RequestHandler = async ({ url, locals }): Promise<Response> => {
    try {
        const page: number = Number(url.searchParams.get('page')) || 1;
        const limit: number = Number(url.searchParams.get('limit')) || 10;
        const query: string = url.searchParams.get('query') || '';
        const sortBy: string = url.searchParams.get('sortBy') || 'equipment_type_translations.name';

        const response = await locals.client.get('/api/equipments', {
            params: { page, limit, query, sortBy },
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
