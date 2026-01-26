import BaseRepository from '#repositories/base/base_repository';
import CompanyEquipmentType from '#models/company_equipment_type';
import Company from '#models/company';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import Language from '#models/language';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PaginatedCompanyEquipmentTypes from '#types/paginated/paginated_company_equipment_types';
import Equipment from '#models/equipment';
import EquipmentTranslation from '#models/equipment_translation';
import EquipmentType from '#models/equipment_type';
import EquipmentTypeTranslation from '#models/equipment_type_translation';

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
        const paginator: ModelPaginatorContract<CompanyEquipmentType> = await this.Model.query()
            .if(query, (qb): void => {
                qb.whereHas('equipmentType', (equipmentTypeQuery): void => {
                    equipmentTypeQuery
                        .where('code', 'ILIKE', `%${query}%`)
                        .orWhereHas('translations', (equipmentTypeTranslationQuery): void => {
                            equipmentTypeTranslationQuery.where('name', 'ILIKE', `%${query}%`).whereHas('language', (languageQuery): void => {
                                languageQuery.where('code', language.code);
                            });
                        })
                        .orWhereHas('equipment', (equipmentQuery): void => {
                            equipmentQuery.where('category', 'ILIKE', `%${query}%`).orWhereHas('translations', (equipmentTranslationQuery): void => {
                                equipmentTranslationQuery.where('name', 'ILIKE', `%${query}%`).whereHas('language', (languageQuery): void => {
                                    languageQuery.where('code', language.code);
                                });
                            });
                        });
                });
            })
            .if(sortBy, (queryBuilder: ModelQueryBuilderContract<typeof CompanyEquipmentType>): void => {
                queryBuilder.orderBy(sortBy.field, sortBy.order);
            })
            .preload('equipmentType', (equipmentTypeQuery): void => {
                equipmentTypeQuery
                    .preload('translations', (equipmentTypeTranslationQuery): void => {
                        equipmentTypeTranslationQuery
                            .whereHas('language', (languageQuery): void => {
                                languageQuery.where('code', language.code);
                            })
                            .preload('language');
                    })
                    .preload('equipment', (equipmentQuery): void => {
                        equipmentQuery
                            .preload('translations', (equipmentTranslationQuery): void => {
                                equipmentTranslationQuery
                                    .whereHas('language', (languageQuery): void => {
                                        languageQuery.where('code', language.code);
                                    })
                                    .preload('language');
                            })
                            .preload('thumbnail');
                    });
            })
            .where('company_equipment_types.company_id', company.id)
            .paginate(page, limit);

        return {
            equipmentTypes: paginator.all().map((equipment: CompanyEquipmentType): SerializedCompanyEquipmentType => equipment.apiSerialize()),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }
}
