import BaseRepository from '#repositories/base/base_repository';
import CompanyEquipmentType from '#models/company_equipment_type';
import Company from '#models/company';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import Language from '#models/language';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PaginatedCompanyEquipmentTypes from '#types/paginated/paginated_company_equipment_types';

export default class CompanyEquipmentTypeRepository extends BaseRepository<typeof CompanyEquipmentType> {
    constructor() {
        super(CompanyEquipmentType);
    }

    public async getCompanyEquipments(company: Company, language: Language, query: string, page: number, limit: number): Promise<PaginatedCompanyEquipmentTypes> {
        const paginator: ModelPaginatorContract<CompanyEquipmentType> = await this.Model.query()
            .select('company_equipment_types.*')
            .leftJoin('equipment_types', 'company_equipment_types.equipment_type_id', 'equipment_types.id')
            .leftJoin('equipments', 'equipment_types.equipment_id', 'equipments.id')
            .leftJoin('equipment_type_translations', 'equipment_types.id', 'equipment_type_translations.equipment_type_id')
            .leftJoin('equipment_translations', 'equipments.id', 'equipment_translations.equipment_id')
            .leftJoin('languages as et_languages', 'equipment_translations.language_id', 'et_languages.id')
            .leftJoin('languages as ett_languages', 'equipment_type_translations.language_id', 'ett_languages.id')
            .if(query, (queryBuilder: ModelQueryBuilderContract<typeof CompanyEquipmentType>): void => {
                queryBuilder.where((subQuery: ModelQueryBuilderContract<typeof CompanyEquipmentType>): void => {
                    subQuery
                        .where('equipments.category', 'ILIKE', `%${query}%`)
                        .orWhere('equipment_translations.name', 'ILIKE', `%${query}%`)
                        .orWhere('equipment_type_translations.name', 'ILIKE', `%${query}%`)
                        .orWhere('equipment_types.code', 'ILIKE', `%${query}%`);
                });
            })
            .preload('equipmentType', (equipmentTypeQuery): void => {
                equipmentTypeQuery
                    .preload('equipment', (equipmentQuery): void => {
                        equipmentQuery.preload('translations', (equipmentTranslationQuery): void => {
                            equipmentTranslationQuery.preload('language', (languageQuery): void => {
                                languageQuery.where('code', language.code);
                            });
                        });
                    })
                    .preload('translations', (equipmentTypeTranslationQuery): void => {
                        equipmentTypeTranslationQuery.preload('language', (languageQuery): void => {
                            languageQuery.where('code', language.code);
                        });
                    });
            })
            .where('company_equipment_types.company_id', company.id)
            .andWhere('et_languages.code', language.code)
            .andWhere('ett_languages.code', language.code)
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
