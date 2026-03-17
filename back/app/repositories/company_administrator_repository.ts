import BaseRepository from '#repositories/base/base_repository';
import CompanyAdministrator from '#models/company_administrator';
import User from '#models/user';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
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
        sortBy: {
            field: keyof CompanyAdministrator['$attributes'] | `users.${keyof User['$attributes']}`;
            order: 'asc' | 'desc';
        }
    ): Promise<PaginatedCompanyAdministrators> {
        const baseQuery = this.Model.query()
            .select('company_administrators.*')
            .leftJoin('companies', 'companies.id', 'company_administrators.company_id')
            .leftJoin('users', 'users.id', 'company_administrators.user_id')
            .where('company_administrators.company_id', company.id);

        if (query) {
            baseQuery.where((root): void => {
                root.whereHas('user', (userQuery): void => {
                    userQuery.where('username', 'ILIKE', `%${query}%`).orWhere('email', 'ILIKE', `%${query}%`);
                });
            });
        }

        if (sortBy) {
            const [table, column] = sortBy.field.toString().split('.');
            baseQuery.orderByRaw(`"${table}"."${column}" ${sortBy.order.toUpperCase()}`);
        }

        baseQuery.preload('user');

        const paginator: ModelPaginatorContract<CompanyAdministrator> = await baseQuery.paginate(page, limit);

        return {
            administrators: paginator.all().map((admin: CompanyAdministrator): SerializedCompanyAdministrator => admin.apiSerialize()),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }
}
