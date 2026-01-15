import BaseRepository from '#repositories/base/base_repository';
import EquipmentType from '#models/equipment_type';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PaginatedEquipmentTypes from '#types/paginated/paginated_equipment_types';
import Language from '#models/language';
import SerializedEquipmentTypeExtended from '#types/serialized/serialized_equipment_type_extended';
import Equipment from '#models/equipment';
import EquipmentTranslation from '#models/equipment_translation';
import EquipmentTypeTranslation from '#models/equipment_type_translation';

export default class EquipmentTypeRepository extends BaseRepository<typeof EquipmentType> {
    constructor() {
        super(EquipmentType);
    }

    public async getOneAndTranslation(equipmentTypeId: string, language: Language): Promise<EquipmentType> {
        return this.Model.query()
            .where('id', equipmentTypeId)
            .preload('translations', (equipmentTypeTranslationQuery): void => {
                equipmentTypeTranslationQuery.preload('language', (languageQuery): void => {
                    languageQuery.where('code', language.code);
                });
            })
            .firstOrFail();
    }

    public async getEquipments(
        language: Language,
        query: string,
        page: number,
        limit: number,
        sortBy: {
            field:
                | `equipments.${keyof Equipment['$attributes']}`
                | `equipment_translations.${keyof EquipmentTranslation['$attributes']}`
                | `equipment_types.${keyof EquipmentType['$attributes']}`
                | `equipment_type_translations.${keyof EquipmentTypeTranslation['$attributes']}`;
            order: 'asc' | 'desc';
        }
    ): Promise<PaginatedEquipmentTypes> {
        const paginator: ModelPaginatorContract<EquipmentType> = await this.Model.query()
            .select('equipment_types.*')
            .leftJoin('equipments', 'equipment_types.equipment_id', 'equipments.id')
            .leftJoin('equipment_type_translations', 'equipment_types.id', 'equipment_type_translations.equipment_type_id')
            .leftJoin('equipment_translations', 'equipments.id', 'equipment_translations.equipment_id')
            .leftJoin('languages as et_languages', 'equipment_translations.language_id', 'et_languages.id')
            .leftJoin('languages as ett_languages', 'equipment_type_translations.language_id', 'ett_languages.id')
            .if(query, (queryBuilder: ModelQueryBuilderContract<typeof EquipmentType>): void => {
                queryBuilder.where((subQuery: ModelQueryBuilderContract<typeof EquipmentType>): void => {
                    subQuery
                        .where('equipments.category', 'ILIKE', `%${query}%`)
                        .orWhere('equipment_translations.name', 'ILIKE', `%${query}%`)
                        .orWhere('equipment_type_translations.name', 'ILIKE', `%${query}%`)
                        .orWhere('equipment_types.code', 'ILIKE', `%${query}%`);
                });
            })
            .if(sortBy, (queryBuilder: ModelQueryBuilderContract<typeof EquipmentType>): void => {
                queryBuilder.orderBy(sortBy.field, sortBy.order);
            })
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
            })
            .where('et_languages.code', language.code)
            .andWhere('ett_languages.code', language.code)
            .paginate(page, limit);

        return {
            equipments: paginator.all().map((equipment: EquipmentType): SerializedEquipmentTypeExtended => equipment.apiSerializeExtended()),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }
}
