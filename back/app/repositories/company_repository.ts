import BaseRepository from '#repositories/base/base_repository';
import Company from '#models/company';
import Language from '#models/language';
import type { Cluster } from '#types/cluster';
import db from '@adonisjs/lucid/services/db';
import SerializedCompany from '#types/serialized/serialized_company';
import User from '#models/user';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PaginatedCompanies from '#types/paginated/paginated_companies';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';
import SerializedCompanyLight from '#types/serialized/serialized_company_light';
import Address from '#models/address';
import { TransactionClientContract } from '@adonisjs/lucid/types/database';
import { DeleteCompanyResult } from '#types/delete_company_result';

export default class CompanyRepository extends BaseRepository<typeof Company> {
    constructor() {
        super(Company);
    }

    public async getClusters(minLat: number, maxLat: number, minLng: number, maxLng: number, precision: number, language: Language, equipmentIds: string[]): Promise<Cluster[]> {
        let query: string = `
            SELECT
                LEFT(address.geohash, ?) AS cluster,
                AVG(address.latitude) AS lat,
                AVG(address.longitude) AS lng,
                array_agg(DISTINCT address.id) AS address_ids,
                COUNT(DISTINCT company.id) > 1 AS "isCluster"
            FROM addresses address
              INNER JOIN companies company ON company.address_id = address.id
              INNER JOIN company_equipment_types equipment_type ON equipment_type.company_id = company.id
            WHERE company.enabled = TRUE
              AND address.latitude BETWEEN ? AND ?
              AND address.longitude BETWEEN ? AND ?
        `;

        const bindings: any[] = [precision, minLat, maxLat, minLng, maxLng];

        if (equipmentIds.length > 0) {
            query += `AND equipment_type.equipment_type_id IN (${equipmentIds.map((): string => '?').join(', ')})`;
            bindings.push(...equipmentIds);
        }

        query += `GROUP BY cluster`;

        const result = await db.rawQuery(query, bindings);

        const clusters: Cluster[] = [];

        for (const row of result.rows) {
            const companies: Company[] = await Company.query().whereIn('address_id', row.address_ids);

            clusters.push({
                id: row.cluster,
                lat: row.lat,
                lng: row.lng,
                isCluster: row.isCluster,
                companies: companies.map((company: Company): SerializedCompanyLight => company.apiSerializeLight(language)),
            });
        }

        return clusters;
    }

    public async getProfileCompanies(
        user: User,
        language: Language,
        query: string,
        page: number,
        limit: number,
        sortBy: { field: keyof Company['$attributes']; order: 'asc' | 'desc' }
    ): Promise<PaginatedCompanies> {
        const paginator: ModelPaginatorContract<Company> = await Company.query()
            .select('companies.*')
            .innerJoin('company_administrators', 'company_administrators.company_id', 'companies.id')
            .where('company_administrators.user_id', user.id)
            .if(query, (queryBuilder: ModelQueryBuilderContract<typeof Company>): void => {
                queryBuilder.where((subQuery): void => {
                    subQuery
                        .where('companies.name', 'ILIKE', `%${query}%`)
                        .orWhere('companies.siret', 'ILIKE', `%${query}%`)
                        .orWhere('companies.email', 'ILIKE', `%${query}%`)
                        .orWhere('companies.phone_number', 'ILIKE', `%${query}%`);
                });
            })
            .if(sortBy, (queryBuilder: ModelQueryBuilderContract<typeof Company>): void => {
                queryBuilder.orderBy(sortBy.field as string, sortBy.order);
            })
            .if(!sortBy, (queryBuilder: ModelQueryBuilderContract<typeof Company>): void => {
                queryBuilder.orderBy('companies.name', 'asc');
            })
            .preload('address')
            .preload('equipments')
            .preload('administrators')
            .paginate(page, limit);

        return {
            companies: paginator.all().map((company: Company): SerializedCompany => company.apiSerialize(language)),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }

    public async delete(ids: string[], user: User): Promise<DeleteCompanyResult[]> {
        return await Promise.all(
            ids.map(async (id: string): Promise<DeleteCompanyResult> => {
                try {
                    return await db.transaction(async (trx: TransactionClientContract): Promise<DeleteCompanyResult> => {
                        const company: Company = await Company.query({ client: trx })
                            .innerJoin('company_administrators', 'company_administrators.company_id', 'companies.id')
                            .where('companies.id', id)
                            .andWhere('company_administrators.user_id', user.id)
                            .andWhere('company_administrators.role', CompanyAdministratorRoleEnum.CEO)
                            .select('companies.*')
                            .firstOrFail();

                        const addressId: string = company.addressId;

                        await Company.query({ client: trx }).where('id', id).delete();

                        if (addressId) {
                            await Address.query({ client: trx }).where('id', addressId).delete();
                        }

                        return { isDeleted: true, name: company.name, id };
                    });
                } catch (error: any) {
                    return { isDeleted: false, id };
                }
            })
        );
    }

    public async getFromUser(companyId: string, user: User): Promise<Company> {
        return await Company.query()
            .select('companies.*')
            .innerJoin('company_administrators', 'company_administrators.company_id', 'companies.id')
            .where('companies.id', companyId)
            .andWhere('company_administrators.user_id', user.id)
            .firstOrFail();
    }
}
