import BaseRepository from '#repositories/base/base_repository';
import CompanyAdministrator from '#models/company_administrator';
import User from '#models/user';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PaginatedCompanyAdministrators from '#types/paginated/paginated_company_administrators';
import SerializedCompanyAdministrator from '#types/serialized/serialized_company_administrator';
import Company from '#models/company';

export default class CompanyAdministratorRepository extends BaseRepository<typeof CompanyAdministrator> {
    constructor() {
        super(CompanyAdministrator);
    }

    public async getAdministrators(
        company: Company,
        query: string,
        page: number,
        limit: number,
        sortBy: { field: keyof CompanyAdministrator['$attributes'] | keyof User['$attributes']; order: 'asc' | 'desc' }
    ): Promise<PaginatedCompanyAdministrators> {
        const paginator: ModelPaginatorContract<CompanyAdministrator> = await this.Model.query()
            .select('company_administrators.*', 'users.username', 'users.email', 'companies.name')
            .leftJoin('users', 'company_administrators.userId', 'users.id')
            .leftJoin('companies', 'company_administrators.companyId', 'companies.id')
            .if(query, (queryBuilder: ModelQueryBuilderContract<typeof CompanyAdministrator>): void => {
                queryBuilder.where('users.username', 'ILIKE', `%${query}%`).orWhere('users.email', 'ILIKE', `%${query}%`);
            })
            .if(sortBy, (queryBuilder: ModelQueryBuilderContract<typeof CompanyAdministrator>): void => {
                queryBuilder.orderBy(sortBy.field as string, sortBy.order);
            })
            .where('company_administrators.companyId', company.id)
            .preload('user')
            .paginate(page, limit);

        return {
            administrators: paginator.all().map((administrator: CompanyAdministrator): SerializedCompanyAdministrator => administrator.apiSerialize()),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }
}
