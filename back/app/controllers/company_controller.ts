import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { getFromSiretValidator } from '#validators/company';
import axios from 'axios';
import env from '#start/env';

@inject()
export default class CompanyController {
    constructor(private readonly companyRepository: CompanyRepository) {}

    public async getFromSiret({ request, response, i18n }: HttpContext): Promise<void> {
        const { siret } = await getFromSiretValidator.validate(request.params());

        try {
            const axiosResponse = await axios.get(`https://api.insee.fr/api-sirene/3.11/siret/${siret}`, {
                headers: {
                    'X-INSEE-Api-Key-Integration': env.get('INSEE_API_KEY'),
                },
            });

            if (axiosResponse.status !== 200) {
                throw axiosResponse;
            }

            return response.ok(axiosResponse.data.etablissement);
        } catch (error: any) {
            if (error.status === 404) {
                return response.notFound({
                    error: i18n.t('messages.company.siret.error.not-found'),
                });
            }

            return response.badRequest({
                error: i18n.t('messages.company.siret.error.default'),
            });
        }
    }
}
