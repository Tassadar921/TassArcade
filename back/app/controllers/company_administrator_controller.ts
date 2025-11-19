import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { HttpContext } from '@adonisjs/core/http';
import { getCompanyAdministratorsValidator } from '#validators/company_administrator';
import cache from '@adonisjs/cache/services/main';
import Company from '#models/company';
import SerializedCompany from '#types/serialized/serialized_company';
import CompanyAdministratorRepository from '#repositories/company_administrator_repository';
import PaginatedCompanyAdministrators from '#types/paginated/paginated_company_administrators';
import UserRepository from '#repositories/user_repository';

@inject()
export default class CompanyAdministratorController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyAdministratorRepository: CompanyAdministratorRepository,
        private readonly userRepository: UserRepository
    ) {}

    public async getAll({ request, response, language, i18n }: HttpContext) {
        const { companyId } = await request.validateUsing(getCompanyAdministratorsValidator);
        const company: Company | null = await this.companyRepository.findOneBy({ id: companyId }, ['administrators']);
        if (!company) {
            return response.notFound({ error: i18n.t('messages.company.get.error.not-found') });
        }

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
            users: await this.userRepository.getSearchCompanyAdministrators(company, '', 1, 10, { field: 'username', order: 'asc' }),
        });

        // users: await cache.getOrSet({
        //     key: `company-search-administrators:companyId:${companyId}:query::page:1:limit:10:sortBy:username:asc`,
        //     tags: [`company:${companyId}`],
        //     ttl: '1h',
        //     factory: async (): Promise<PaginatedSearchCompanyAdministrators> => {
        //         return await this.userRepository.getSearchCompanyAdministrators(company, '', 1, 10, { field: 'username', order: 'asc' });
        //     },
        // }),
    }
}
