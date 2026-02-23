import BaseRepository from '#repositories/base/base_repository';
import Company from '#models/company';
import Language from '#models/language';
import type { Cluster } from '#types/cluster';
import db from '@adonisjs/lucid/services/db';
import SerializedCompany from '#types/serialized/serialized_company';
import User from '#models/user';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import PaginatedCompanies from '#types/paginated/paginated_companies';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';
import SerializedCompanyLight from '#types/serialized/serialized_company_light';
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
            const companies: Company[] = await this.Model.query()
                .whereIn('address_id', row.address_ids)
                .preload('equipments', (equipmentQuery): void => {
                    equipmentQuery.preload('equipmentType', (equipmentTypeQuery): void => {
                        equipmentTypeQuery
                            .preload('translations', (equipmentTypeTranslationQuery): void => {
                                equipmentTypeTranslationQuery.whereHas('language', (languageQuery): void => {
                                    languageQuery.where('code', language.code);
                                });
                            })
                            .preload('equipment', (equipmentQuery): void => {
                                equipmentQuery
                                    .preload('translations', (equipmentTranslationQuery): void => {
                                        equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                                            languageQuery.where('code', language.code);
                                        });
                                    })
                                    .preload('thumbnail');
                            });
                    });
                })
                .preload('address');

            clusters.push({
                id: row.cluster,
                lat: row.lat,
                lng: row.lng,
                isCluster: row.isCluster,
                companies: companies.map((company: Company): SerializedCompanyLight => company.apiSerializeLight()),
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
        const baseQuery = this.Model.query()
            .select('companies.*')
            .innerJoin('company_administrators', 'company_administrators.company_id', 'companies.id')
            .where('company_administrators.user_id', user.id);

        if (query) {
            baseQuery.where((root): void => {
                root.where('companies.name', 'ILIKE', `%${query}%`)
                    .orWhere('companies.siret', 'ILIKE', `%${query}%`)
                    .orWhere('companies.email', 'ILIKE', `%${query}%`)
                    .orWhere('companies.phone_number', 'ILIKE', `%${query}%`);
            });
        }

        if (sortBy) {
            baseQuery.orderBy(`${sortBy.field}`, sortBy.order);
        }

        baseQuery
            .preload('address')
            .preload('equipments', (equipmentQuery): void => {
                equipmentQuery.preload('equipmentType', (equipmentTypeQuery): void => {
                    equipmentTypeQuery
                        .preload('translations', (ett): void => {
                            ett.whereHas('language', (l): void => {
                                l.where('code', language.code);
                            });
                        })
                        .preload('equipment', (eq): void => {
                            eq.preload('translations', (etr): void => {
                                etr.whereHas('language', (l): void => {
                                    l.where('code', language.code);
                                });
                            }).preload('thumbnail');
                        });
                });
            })
            .preload('administrators')
            .preload('logo');

        const paginator: ModelPaginatorContract<Company> = await baseQuery.paginate(page, limit);

        return {
            companies: paginator.all().map((company: Company): SerializedCompany => company.apiSerialize()),
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
                        const company: Company = await this.Model.query({ client: trx })
                            .select('companies.*')
                            .innerJoin('company_administrators', 'company_administrators.company_id', 'companies.id')
                            .where('companies.id', id)
                            .andWhere('company_administrators.user_id', user.id)
                            .andWhere('company_administrators.role', CompanyAdministratorRoleEnum.CEO)
                            .preload('address')
                            .preload('logo')
                            .firstOrFail();

                        await company.useTransaction(trx).delete();
                        await company.address.useTransaction(trx).delete();
                        if (company.logo) {
                            await company.logo.useTransaction(trx).delete();
                        }

                        return { isDeleted: true, name: company.name, id };
                    });
                } catch (e) {
                    console.log(e);
                    return { isDeleted: false, id };
                }
            })
        );
    }

    public async getFromUser(companyId: string, user: User): Promise<Company> {
        return this.Model.query()
            .select('companies.*')
            .innerJoin('company_administrators', 'company_administrators.company_id', 'companies.id')
            .where('companies.id', companyId)
            .andWhere('company_administrators.user_id', user.id)
            .preload('address')
            .preload('logo')
            .firstOrFail();
    }

    public async getOne(companyId: string, language: Language): Promise<Company> {
        return this.Model.query()
            .where('companies.id', companyId)
            .preload('address')
            .preload('logo')
            .preload('equipments', (equipmentQuery): void => {
                equipmentQuery.preload('equipmentType', (equipmentTypeQuery): void => {
                    equipmentTypeQuery
                        .preload('translations', (ett): void => {
                            ett.whereHas('language', (l): void => {
                                l.where('code', language.code);
                            });
                        })
                        .preload('equipment', (eq): void => {
                            eq.preload('translations', (etr): void => {
                                etr.whereHas('language', (l): void => {
                                    l.where('code', language.code);
                                });
                            }).preload('thumbnail');
                        });
                });
            })
            .firstOrFail();
    }
}
