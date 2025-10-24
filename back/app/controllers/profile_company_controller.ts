import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import cache from '@adonisjs/cache/services/main';
import User from '#models/user';
import CompanyRepository from '#repositories/company_repository';
import PaginatedCompanies from '#types/paginated/paginated_companies';
import { searchProfileCompaniesValidator, deleteProfileCompaniesValidator, getProfileCompanyValidator, updateProfileCompanyValidator } from '#validators/profile-company';
import Company from '#models/company';
import SerializedCompany from '#types/serialized/serialized_company';
import CountryList, { Country } from 'country-list-with-dial-code-and-flag';

@inject()
export default class ProfileCompanyController {
    constructor(private readonly companyRepository: CompanyRepository) {}

    public async getAll({ request, response, user, language }: HttpContext): Promise<void> {
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchProfileCompaniesValidator);

        return response.ok(
            await cache.getOrSet({
                key: `profile-companies:${user.id}:query:${query}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: ['profile-companies'],
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
        const { companies } = await request.validateUsing(deleteProfileCompaniesValidator);

        const statuses: { isDeleted: boolean; name?: string; id: string }[] = await this.companyRepository.delete(companies, user);

        return response.ok({
            messages: await Promise.all(
                statuses.map(async (status: { isDeleted: boolean; name?: string; id: string }): Promise<{ id: string; message: string; isSuccess: boolean }> => {
                    if (status.isDeleted) {
                        await cache.deleteByTag({ tags: ['profile-companies', `profile-company:${status.id}`] });
                        return { id: status.id, message: i18n.t(`messages.profile.company.delete.success`, { name: status.name }), isSuccess: true };
                    } else {
                        return { id: status.id, message: i18n.t(`messages.profile.company.delete.error.default`, { id: status.id }), isSuccess: false };
                    }
                })
            ),
        });
    }

    public async update({ request, response, i18n, language }: HttpContext) {
        const { siret, name, address, postalCode, city, complement, countryCode, email, phoneNumber } = await request.validateUsing(updateProfileCompanyValidator);

        const country: Country | undefined = CountryList.default.findOneByCountryCode(countryCode);
        if (!country) {
            return response.badRequest({
                error: i18n.t('messages.profile.company.update.error.invalid-country-code', { countryCode }),
            });
        }

        const company: Company = await this.companyRepository.firstOrFail({ siret });

        company.name = name;
        company.address.address = address;
        company.address.postalCode = postalCode;
        company.address.city = city;
        company.address.address = address;
        if (complement) {
            company.address.complement = complement;
        }
        if (email) {
            company.email = email;
        }
        if (phoneNumber) {
            company.phoneNumber = phoneNumber;
        }

        await Promise.all([company.save(), company.address.save(), cache.deleteByTag({ tags: ['profile-companies', `profile-company:${company.id}`] })]);

        return response.ok({ company: company.apiSerialize(language), message: i18n.t('messages.profile.company.update.success', { name }) });
    }

    public async get({ request, response, i18n, language }: HttpContext): Promise<void> {
        const { siret } = await getProfileCompanyValidator.validate(request.params());
        const company: Company | null = await this.companyRepository.findOneBy({ siret }, ['address', 'administrators', 'equipments']);
        if (!company) {
            return response.notFound({ error: i18n.t('messages.profile.company.get.error.not-found') });
        }

        return response.ok(
            await cache.getOrSet({
                key: `profile-company:${company.id}`,
                tags: [`profile-company:${company.id}`],
                ttl: '1h',
                factory: (): SerializedCompany => {
                    return company.apiSerialize(language);
                },
            })
        );
    }
}
