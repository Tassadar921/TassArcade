import BaseRepository from '#repositories/base/base_repository';
import EquipmentType from '#models/equipment_type';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import PaginatedEquipmentTypes from '#types/paginated/paginated_equipment_types';
import Language from '#models/language';
import SerializedEquipmentTypeExtended from '#types/serialized/serialized_equipment_type_extended';
import Equipment from '#models/equipment';
import EquipmentTranslation from '#models/equipment_translation';
import EquipmentTypeTranslation from '#models/equipment_type_translation';
import { DeleteEquipmentTypeResult } from '#types/delete_equipment_type_result';
import db from '@adonisjs/lucid/services/db';

export default class EquipmentTypeRepository extends BaseRepository<typeof EquipmentType> {
    constructor() {
        super(EquipmentType);
    }

    public async getOneAndTranslation(equipmentTypeId: string, language: Language): Promise<EquipmentType> {
        return this.Model.query()
            .where('id', equipmentTypeId)
            .preload('translations', (equipmentTranslationQuery): void => {
                equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                    languageQuery.where('code', language.code);
                });
            })
            .firstOrFail();
    }

    public async getEquipmentTypes(
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
        const baseQuery = this.Model.query().select('equipment_types.*').leftJoin('equipments', 'equipment_types.equipment_id', 'equipments.id');

        if (query) {
            baseQuery.where((root): void => {
                root.where('equipment_types.code', 'ILIKE', `%${query}%`)
                    .orWhereHas('translations', (ettQb): void => {
                        ettQb.where('name', 'ILIKE', `%${query}%`);
                    })
                    .orWhereHas('equipment', (equipmentQb): void => {
                        equipmentQb.where('category', 'ILIKE', `%${query}%`).orWhereHas('translations', (etQb): void => {
                            etQb.where('name', 'ILIKE', `%${query}%`);
                        });
                    });
            });
        }

        if (sortBy) {
            const [table, field] = sortBy.field.split('.');

            if (table.endsWith('_translations')) {
                let foreignKey: string;
                let parentTable: string;

                if (table === 'equipment_type_translations') {
                    foreignKey = 'equipment_type_id';
                    parentTable = 'equipment_types';
                } else if (table === 'equipment_translations') {
                    foreignKey = 'equipment_id';
                    parentTable = 'equipments';
                } else {
                    throw new Error(`Unknown translation table for sortBy: ${table}`);
                }

                baseQuery.orderBy(
                    db
                        .from(table)
                        .whereColumn(`${table}.${foreignKey}`, `${parentTable}.id`)
                        .whereExists((qb): void => {
                            qb.from('languages').whereColumn('languages.id', `${table}.language_id`).where('languages.code', language.code);
                        })
                        .select(field)
                        .limit(1),
                    sortBy.order
                );
            } else {
                baseQuery.orderBy(sortBy.field, sortBy.order);
            }
        }

        baseQuery
            .preload('equipment', (equipmentQuery): void => {
                equipmentQuery
                    .preload('translations', (equipmentTranslationQuery): void => {
                        equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                            languageQuery.where('code', language.code);
                        });
                    })
                    .preload('thumbnail');
            })
            .preload('translations', (equipmentTypeTranslationQuery): void => {
                equipmentTypeTranslationQuery.whereHas('language', (languageQuery): void => {
                    languageQuery.where('code', language.code);
                });
            });

        const paginator: ModelPaginatorContract<EquipmentType> = await baseQuery.paginate(page, limit);

        return {
            equipments: paginator.all().map((equipment: EquipmentType): SerializedEquipmentTypeExtended => equipment.apiSerializeExtended()),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }

    public async delete(equipmentTypeIds: string[], language: Language): Promise<DeleteEquipmentTypeResult[]> {
        const results: DeleteEquipmentTypeResult[] = [];

        for (const equipmentTypeId of equipmentTypeIds) {
            try {
                const equipmentType: EquipmentType | null = await this.Model.query()
                    .where('id', equipmentTypeId)
                    .preload('translations', (query): void => {
                        query.whereHas('language', (languageQuery): void => {
                            languageQuery.where('code', language.code);
                        });
                    })
                    .first();

                if (!equipmentType) {
                    results.push({
                        id: equipmentTypeId,
                        name: '',
                        isDeleted: false,
                    });
                    continue;
                }

                const name: string = equipmentType.translations.length > 0 ? equipmentType.translations[0].name : equipmentType.code;

                await equipmentType.delete();
                results.push({
                    id: equipmentTypeId,
                    name,
                    isDeleted: true,
                });
            } catch (error) {
                results.push({
                    id: equipmentTypeId,
                    name: '',
                    isDeleted: false,
                });
            }
        }

        return results;
    }

    public async findOneBy(criteria: { code?: string }): Promise<EquipmentType | null> {
        const query = this.Model.query();

        if (criteria.code) {
            query.where('code', criteria.code);
        }

        return await query.first();
    }

    public async getOneByCode(code: string, language: Language): Promise<EquipmentType | null> {
        return this.Model.query()
            .where('code', code)
            .preload('translations', (query): void => {
                query.whereHas('language', (languageQuery): void => {
                    languageQuery.where('code', language.code);
                });
            })
            .first();
    }

    public async getOneById(id: string, language: Language): Promise<EquipmentType | null> {
        return this.Model.query()
            .where('id', id)
            .preload('translations', (query): void => {
                query.whereHas('language', (languageQuery): void => {
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
            })
            .first();
    }

    public async loadForSerialization(equipmentType: EquipmentType, language: Language): Promise<EquipmentType> {
        await equipmentType.load((equipmentTypeQuery): void => {
            equipmentTypeQuery
                .load('equipment', (equipmentQuery): void => {
                    equipmentQuery
                        .preload('translations', (equipmentTranslationQuery): void => {
                            equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                                languageQuery.where('code', language.code);
                            });
                        })
                        .preload('thumbnail');
                })
                .load('translations', (translationQuery): void => {
                    translationQuery.whereHas('language', (languageQuery): void => {
                        languageQuery.where('code', language.code);
                    });
                });
        });

        return equipmentType;
    }
}
