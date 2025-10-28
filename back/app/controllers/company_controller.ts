import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { createCompanyValidator, getCompanyFromSiretValidator, getCompanyValidator, searchCompaniesValidator, updateCompanyValidator, deleteCompaniesValidator } from '#validators/company';
import axios from 'axios';
import env from '#start/env';
import Company from '#models/company';
import Address from '#models/address';
import CountryList, { Country } from 'country-list-with-dial-code-and-flag';
import CompanyAdministrator from '#models/company_administrator';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';
import NominatimService from '#services/nominatim_service';
import { parsePhoneNumberFromString, PhoneNumber } from 'libphonenumber-js';
import cache from '@adonisjs/cache/services/main';
import PaginatedCompanies from '#types/paginated/paginated_companies';
import User from '#models/user';
import SerializedCompany from '#types/serialized/serialized_company';

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
        const { siret, name, address: inputAddress, postalCode, city, complement, countryCode, email, phoneNumber: inputPhoneNumber } = await request.validateUsing(createCompanyValidator);

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

        let phoneNumber: PhoneNumber | undefined;
        if (inputPhoneNumber) {
            phoneNumber = parsePhoneNumberFromString(`${country.dialCode} ${inputPhoneNumber}`);
            if (!phoneNumber) {
                return response.badRequest({
                    error: i18n.t('messages.company.create.error.invalid-phone-number', { phoneNumber: inputPhoneNumber }),
                });
            }
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
            phoneNumber: phoneNumber?.format('E.164'),
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

    public async getAll({ request, response, user, language }: HttpContext): Promise<void> {
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchCompaniesValidator);

        return response.ok(
            await cache.getOrSet({
                key: `companies:${user.id}:query:${query}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: ['companies'],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanies> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = { field: field as keyof User['$attributes'], order: order as 'asc' | 'desc' };

                    return await this.companyRepository.getProfileCompanies(user, language, query, page, limit, sortBy);
                },
            })
        );
    }

    public async delete({ request, response, i18n, user }: HttpContext): Promise<void> {
        const { companies } = await request.validateUsing(deleteCompaniesValidator);

        const statuses: { isDeleted: boolean; name?: string; id: string }[] = await this.companyRepository.delete(companies, user);

        return response.ok({
            messages: await Promise.all(
                statuses.map(async (status: { isDeleted: boolean; name?: string; id: string }): Promise<{ id: string; message: string; isSuccess: boolean }> => {
                    if (status.isDeleted) {
                        await cache.deleteByTag({ tags: ['companies', `company:${status.id}`] });
                        return { id: status.id, message: i18n.t(`messages.company.delete.success`, { name: status.name }), isSuccess: true };
                    } else {
                        return { id: status.id, message: i18n.t(`messages.company.delete.error.default`, { id: status.id }), isSuccess: false };
                    }
                })
            ),
        });
    }

    public async update({ request, response, i18n, language }: HttpContext) {
        const { siret, name, address: inputAddress, postalCode, city, complement, countryCode, email, phoneNumber: inputPhoneNumber } = await request.validateUsing(updateCompanyValidator);

        const country: Country | undefined = CountryList.default.findOneByCountryCode(countryCode);
        if (!country) {
            return response.badRequest({
                error: i18n.t('messages.company.update.error.invalid-country-code', { countryCode }),
            });
        }

        const company: Company = await this.companyRepository.firstOrFail({ siret });

        const fullAddress: string = `${inputAddress}, ${postalCode} ${city}, ${country.name}`;
        const data: { latitude: number; longitude: number } | null = await this.nominatimService.getFromAddress(fullAddress);

        if (!data) {
            return response.badRequest({
                error: i18n.t('messages.company.update.error.invalid-address', { address: fullAddress }),
            });
        }

        company.name = name;
        company.address.address = inputAddress;
        company.address.postalCode = postalCode;
        company.address.city = city;
        company.address.latitude = data.latitude;
        company.address.longitude = data.longitude;
        if (complement) {
            company.address.complement = complement;
        }
        if (email) {
            company.email = email;
        }

        let phoneNumber: PhoneNumber | undefined;
        if (inputPhoneNumber) {
            phoneNumber = parsePhoneNumberFromString(`${country.dialCode} ${inputPhoneNumber}`);
            if (!phoneNumber) {
                return response.badRequest({
                    error: i18n.t('messages.company.update.error.invalid-phone-number', { phoneNumber: inputPhoneNumber }),
                });
            }
            company.phoneNumber = phoneNumber.format('E.164');
        }

        await Promise.all([company.save(), company.address.save(), cache.deleteByTag({ tags: ['companies', `company:${company.id}`] })]);

        return response.ok({ company: company.apiSerialize(language), message: i18n.t('messages.company.update.success', { name }) });
    }

    public async get({ request, response, i18n, language }: HttpContext): Promise<void> {
        const { siret } = await getCompanyValidator.validate(request.params());
        const company: Company | null = await this.companyRepository.findOneBy({ siret }, ['address', 'administrators', 'equipments']);
        if (!company) {
            return response.notFound({ error: i18n.t('messages.company.get.error.not-found') });
        }

        return response.ok(
            await cache.getOrSet({
                key: `company:${company.id}`,
                tags: [`company:${company.id}`],
                ttl: '1h',
                factory: (): SerializedCompany => {
                    return company.apiSerialize(language);
                },
            })
        );
    }
}
