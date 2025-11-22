import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { HttpContext } from '@adonisjs/core/http';
import { companyIdValidator, searchCompanyAdministratorsValidator } from '#validators/company_administrator';
import cache from '@adonisjs/cache/services/main';
import Company from '#models/company';
import SerializedCompany from '#types/serialized/serialized_company';
import CompanyAdministratorRepository from '#repositories/company_administrator_repository';
import PaginatedCompanyAdministrators from '#types/paginated/paginated_company_administrators';
import UserRepository from '#repositories/user_repository';
import PaginatedSearchCompanyAdministrators from '#types/paginated/paginated_search_company_administrators';
import User from '#models/user';

@inject()
export default class CompanyAdministratorController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyAdministratorRepository: CompanyAdministratorRepository,
        private readonly userRepository: UserRepository
    ) {}

    public async getAll({ request, response, user }: HttpContext): Promise<void> {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchCompanyAdministratorsValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        return response.ok(
            await cache.getOrSet({
                key: `company-administrators:companyId:${companyId}:query:${query.toLowerCase()}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanyAdministrators> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = { field: field as keyof User['$attributes'], order: order as 'asc' | 'desc' };

                    return await this.companyAdministratorRepository.getAdministrators(company, query.toLowerCase(), page, limit, sortBy);
                },
            })
        );
    }

    public async init({ request, response, language, user }: HttpContext) {
        const { companyId } = await companyIdValidator.validate(request.params());
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        return response.ok({
            company: await cache.getOrSet({
                key: `company:${company.id}`,
                tags: [`company:${company.id}`],
                ttl: '1h',
                factory: (): SerializedCompany => {
                    return company.apiSerialize(language);
                },
            }),
            administrators: await cache.getOrSet({
                key: `company-administrators:companyId:${companyId}:query::page:1:limit:10:sortBy:username:asc`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedCompanyAdministrators> => {
                    return await this.companyAdministratorRepository.getAdministrators(company, '', 1, 10, { field: 'username', order: 'asc' });
                },
            }),
            users: await cache.getOrSet({
                key: `company-search-administrators:companyId:${companyId}:query::page:1:limit:10:sortBy:username:asc`,
                tags: [`company:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedSearchCompanyAdministrators> => {
                    return await this.userRepository.getSearchCompanyAdministrators(company, '', 1, 10, { field: 'username', order: 'asc' });
                },
            }),
        });
    }
}
