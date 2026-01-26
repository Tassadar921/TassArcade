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
            .leftJoin('equipment_type_translations', 'equipment_type_translations.equipment_type_id', 'equipment_types.id')
            .leftJoin('equipments', 'equipment_types.equipment_id', 'equipments.id')
            .leftJoin('equipment_translations', 'equipment_translations.equipment_id', 'equipments.id')
            .if(query, (qb): void => {
                qb.where((subQb): void => {
                    subQb
                        .where('code', 'ILIKE', `%${query}%`)

                        .orWhereHas('translations', (ettQb): void => {
                            ettQb.where('name', 'ILIKE', `%${query}%`);
                        })

                        .orWhereHas('equipment', (equipmentQb): void => {
                            equipmentQb
                                .where('category', 'ILIKE', `%${query}%`)

                                .orWhereHas('translations', (etQb): void => {
                                    etQb.where('name', 'ILIKE', `%${query}%`);
                                });
                        });
                });
            })
            .if(sortBy, (queryBuilder: ModelQueryBuilderContract<typeof EquipmentType>): void => {
                queryBuilder.orderBy(sortBy.field, sortBy.order);
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
            })
            .preload('translations', (equipmentTypeTranslationQuery): void => {
                equipmentTypeTranslationQuery
                    .whereHas('language', (languageQuery): void => {
                        languageQuery.where('code', language.code);
                    })
                    .preload('language');
            })
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
