import { inject } from '@adonisjs/core';
import CompanyRepository from '#repositories/company_repository';
import { HttpContext } from '@adonisjs/core/http';
import { addAdministratorValidator, companyIdValidator, removeAdministratorValidator, searchCompanyAdministratorsValidator, searchUsersValidator } from '#validators/company_administrator';
import cache from '@adonisjs/cache/services/main';
import Company from '#models/company';
import CompanyAdministratorRepository from '#repositories/company_administrator_repository';
import PaginatedCompanyAdministrators from '#types/paginated/paginated_company_administrators';
import UserRepository from '#repositories/user_repository';
import PaginatedSearchCompanyAdministrators from '#types/paginated/paginated_search_company_administrators';
import User from '#models/user';
import CompanyAdministrator from '#models/company_administrator';
import SerializedCompany from '#types/serialized/serialized_company';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';

@inject()
export default class CompanyAdministratorController {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly companyAdministratorRepository: CompanyAdministratorRepository,
        private readonly userRepository: UserRepository
    ) {}

    public async init({ request, response, language, user }: HttpContext) {
        const { companyId } = await companyIdValidator.validate(request.params());
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        await cache.deleteByTag({ tags: [`company:${companyId}`] });

        return response.ok({
            company: await cache.getOrSet({
                key: `company:${company.id}`,
                tags: [`company:${companyId}`],
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
                    const sortBy = { field: field as keyof CompanyAdministrator['$attributes'] | `users.${keyof User['$attributes']}`, order: order as 'asc' | 'desc' };

                    return await this.companyAdministratorRepository.getAdministrators(company, query.toLowerCase(), page, limit, sortBy);
                },
            })
        );
    }

    public async searchUsers({ request, response, user }: HttpContext): Promise<void> {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchUsersValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        await cache.deleteByTag({ tags: [`company:${companyId}`] });

        return response.ok(
            await cache.getOrSet({
                key: `company-search-administrators:companyId:${companyId}:query:${query.toLowerCase()}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: [`company:${companyId}`, `company-search-users:${companyId}`],
                ttl: '1h',
                factory: async (): Promise<PaginatedSearchCompanyAdministrators> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = { field: field as keyof User['$attributes'], order: order as 'asc' | 'desc' };

                    return await this.userRepository.getSearchCompanyAdministrators(company, query.toLowerCase(), page, limit, sortBy);
                },
            })
        );
    }

    public async addAdministrator({ request, response, user, i18n }: HttpContext): Promise<void> {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { userId } = await request.validateUsing(addAdministratorValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const existingAdministrator: CompanyAdministrator | null = await this.companyAdministratorRepository.findOneBy({ companyId: company.id, userId });
        if (existingAdministrator) {
            return response.badRequest({
                error: i18n.t('messages.administrator.add.error.already-exists', { username: existingAdministrator.user.username }),
            });
        }

        const administrator: CompanyAdministrator = await CompanyAdministrator.create({ companyId: company.id, userId, role: CompanyAdministratorRoleEnum.ADMINISTRATOR });
        await Promise.all([cache.deleteByTag({ tags: [`company:${companyId}`] }), administrator.load('user')]);

        return response.ok({
            message: i18n.t('messages.administrator.add.success', { username: administrator.user.username }),
            administrator: administrator.apiSerialize(),
        });
    }

    public async removeAdministrator({ request, response, user, i18n }: HttpContext): Promise<void> {
        const { companyId } = await companyIdValidator.validate(request.params());
        const { userId } = await request.validateUsing(removeAdministratorValidator);
        const company: Company = await this.companyRepository.getFromUser(companyId, user);

        const administrator: CompanyAdministrator | null = await this.companyAdministratorRepository.findOneBy({ companyId: company.id, userId });
        if (!administrator) {
            return response.notFound({
                error: i18n.t('messages.administrator.remove.error.not-found'),
            });
        } else if (administrator.role === CompanyAdministratorRoleEnum.CEO) {
            return response.badRequest({
                error: i18n.t('messages.administrator.remove.error.ceo'),
            });
        }

        await Promise.all([administrator.delete(), cache.deleteByTag({ tags: [`company:${companyId}`] })]);

        return response.ok({ message: i18n.t('messages.administrator.remove.success', { username: administrator.user.username }) });
    }
}
