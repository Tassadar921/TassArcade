import BaseRepository from '#repositories/base/base_repository';
import CompanyEquipmentType from '#models/company_equipment_type';
import Company from '#models/company';
import Language from '#models/language';
import PaginatedCompanyEquipmentTypes from '#types/paginated/paginated_company_equipment_types';
import Equipment from '#models/equipment';
import EquipmentTranslation from '#models/equipment_translation';
import EquipmentType from '#models/equipment_type';
import EquipmentTypeTranslation from '#models/equipment_type_translation';
import db from '@adonisjs/lucid/services/db';
import { TransactionClientContract } from '@adonisjs/lucid/types/database';
import { DeleteCompanyEquipmentTypeResult } from '#types/delete_company_equipment_type_result';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';

export default class CompanyEquipmentTypeRepository extends BaseRepository<typeof CompanyEquipmentType> {
    constructor() {
        super(CompanyEquipmentType);
    }

    public async getCompanyEquipments(
        company: Company,
        language: Language,
        query: string,
        page: number,
        limit: number,
        sortBy: {
            field:
                | `company_equipment_types.${keyof CompanyEquipmentType['$attributes']}`
                | `equipments.${keyof Equipment['$attributes']}`
                | `equipment_translations.${keyof EquipmentTranslation['$attributes']}`
                | `equipment_types.${keyof EquipmentType['$attributes']}`
                | `equipment_type_translations.${keyof EquipmentTypeTranslation['$attributes']}`;
            order: 'asc' | 'desc';
        }
    ): Promise<PaginatedCompanyEquipmentTypes> {
        const baseQuery = this.Model.query().where('company_equipment_types.company_id', company.id);

        if (query) {
            baseQuery.where((root): void => {
                root.where('company_equipment_types.name', 'ILIKE', `%${query}%`)
                    .orWhere('company_equipment_types.description', 'ILIKE', `%${query}%`)
                    .orWhereHas('equipmentType', (eqType): void => {
                        eqType
                            .where('code', 'ILIKE', `%${query}%`)
                            .orWhereHas('translations', (ett): void => {
                                ett.where('name', 'ILIKE', `%${query}%`).whereHas('language', (l) => l.where('code', language.code));
                            })
                            .orWhereHas('equipment', (eq): void => {
                                eq.where('category', 'ILIKE', `%${query}%`).orWhereHas('translations', (etr): void => {
                                    etr.where('name', 'ILIKE', `%${query}%`).whereHas('language', (l) => l.where('code', language.code));
                                });
                            });
                    });
            });
        }

        if (sortBy) {
            const [table, column] = sortBy.field.split('.') as [string, string];

            if (table === 'company_equipment_types') {
                baseQuery.orderBy(`company_equipment_types.${column}`, sortBy.order);
            } else {
                let subquery: string;

                switch (table) {
                    case 'equipment_types':
                        subquery = `(SELECT ${column} FROM equipment_types et
                       WHERE et.id = company_equipment_types.equipment_type_id
                       LIMIT 1)`;
                        break;
                    case 'equipment_type_translations':
                        subquery = `(SELECT ett.${column} FROM equipment_type_translations ett
                       JOIN languages l ON l.id = ett.language_id
                       WHERE ett.equipment_type_id = company_equipment_types.equipment_type_id
                       AND l.code = '${language.code}'
                       LIMIT 1)`;
                        break;
                    case 'equipments':
                        subquery = `(SELECT e.${column} FROM equipments e
                       JOIN equipment_types et ON et.equipment_id = e.id
                       WHERE et.id = company_equipment_types.equipment_type_id
                       LIMIT 1)`;
                        break;
                    case 'equipment_translations':
                        subquery = `(SELECT etr.${column} FROM equipment_translations etr
                       JOIN equipments e ON e.id = etr.equipment_id
                       JOIN equipment_types et ON et.equipment_id = e.id
                       JOIN languages l ON l.id = etr.language_id
                       WHERE et.id = company_equipment_types.equipment_type_id
                       AND l.code = '${language.code}'
                       LIMIT 1)`;
                        break;
                    default:
                        throw new Error(`Unsupported sort field: ${sortBy.field}`);
                }

                baseQuery.orderByRaw(`${subquery} ${sortBy.order}`);
            }
        }

        baseQuery.preload('equipmentType', (eqType): void => {
            eqType
                .preload('translations', (ett): void => {
                    ett.whereHas('language', (l) => l.where('code', language.code));
                })
                .preload('equipment', (eq): void => {
                    eq.preload('translations', (etr): void => {
                        etr.whereHas('language', (l) => l.where('code', language.code));
                    }).preload('thumbnail');
                });
        });

        const paginator: ModelPaginatorContract<CompanyEquipmentType> = await baseQuery.paginate(page, limit);

        return {
            equipmentTypes: paginator.all().map((eq: CompanyEquipmentType): SerializedCompanyEquipmentType => eq.apiSerialize()),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }

    public async delete(ids: string[], company: Company, language: Language): Promise<DeleteCompanyEquipmentTypeResult[]> {
        return Promise.all(
            ids.map(async (id: string): Promise<DeleteCompanyEquipmentTypeResult> => {
                try {
                    const companyEquipmentType: CompanyEquipmentType | null = await this.Model.query()
                        .where('id', id)
                        .andWhere('company_id', company.id)
                        .preload('equipmentType', (equipmentTypeQuery): void => {
                            equipmentTypeQuery.preload('translations', (equipmentTypeTranslationQuery): void => {
                                equipmentTypeTranslationQuery.whereHas('language', (languageQuery): void => {
                                    languageQuery.where('code', language.code);
                                });
                            });
                        })
                        .first();

                    if (!companyEquipmentType) {
                        return { isDeleted: false, isFound: false, id };
                    }

                    return await db.transaction(async (trx: TransactionClientContract): Promise<DeleteCompanyEquipmentTypeResult> => {
                        await companyEquipmentType.useTransaction(trx).delete();

                        return {
                            isDeleted: true,
                            isFound: true,
                            name: companyEquipmentType.name || companyEquipmentType.equipmentType.translations[0].name,
                            id,
                        };
                    });
                } catch (error) {
                    return { isDeleted: false, isFound: false, id };
                }
            })
        );
    }
}
