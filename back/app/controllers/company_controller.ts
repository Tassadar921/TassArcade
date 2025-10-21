import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { createCompanyValidator, getCompanyFromSiretValidator } from '#validators/company';
import axios from 'axios';
import env from '#start/env';
import Company from '#models/company';
import Address from '#models/address';
import CountryList, { Country } from 'country-list-with-dial-code-and-flag';
import CompanyAdministrator from '#models/company_administrator';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';
import NominatimService from '#services/nominatim_service';

@inject()
export default class CompanyController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly nominatimService: NominatimService
    ) {}

    public async getFromSiret({ request, response, i18n }: HttpContext): Promise<void> {
        const { siret } = await getCompanyFromSiretValidator.validate(request.params());

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

    public async create({ request, response, user, language, i18n }: HttpContext): Promise<void> {
        const { siret, name, address: inputAddress, postalCode, city, complement, countryCode, email, phoneNumber } = await request.validateUsing(createCompanyValidator);

        let company: Company | null = await this.companyRepository.findOneBy({ siret });
        if (company) {
            return response.conflict({
                error: i18n.t('messages.company.create.error.already-exists', { siret }),
            });
        }

        const country: Country | undefined = CountryList.default.findOneByCountryCode(countryCode);
        if (!country) {
            return response.badRequest({
                error: i18n.t('messages.company.create.error.invalid-country-code', { countryCode }),
            });
        }

        const fullAddress: string = `${inputAddress}, ${postalCode} ${city}, ${country.name}`;
        const data: { latitude: number; longitude: number } | null = await this.nominatimService.getFromAddress(fullAddress);

        if (!data) {
            return response.badRequest({
                error: i18n.t('messages.company.create.error.invalid-address', { address: fullAddress }),
            });
        }

        const address: Address = await Address.create({
            address: inputAddress,
            postalCode,
            city,
            complement,
            country: country.name,
            latitude: data.latitude,
            longitude: data.longitude,
        });
        await address.refresh();

        company = await Company.create({
            siret,
            name,
            email,
            phoneNumber,
            addressId: address.id,
        });
        await company.refresh();

        await CompanyAdministrator.create({
            role: CompanyAdministratorRoleEnum.CEO,
            companyId: company.id,
            userId: user.id,
        });

        await Promise.all([company.load('address'), company.load('equipments')]);

        return response.created({
            message: i18n.t('messages.company.create.success', { companyName: company.name }),
            company: company.apiSerialize(language),
        });
    }
}
