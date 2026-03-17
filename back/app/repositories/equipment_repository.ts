import BaseRepository from '#repositories/base/base_repository';
import Equipment from '#models/equipment';
import Language from '#models/language';
import db from '@adonisjs/lucid/services/db';
import { DeleteEquipmentResult } from '#types/delete_equipment_result';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import PaginatedEquipments from '#types/paginated/paginated_equipments';
import SerializedEquipmentLight from '#types/serialized/serialized_equipment_light';
import EquipmentTranslation from '#models/equipment_translation';

export default class EquipmentRepository extends BaseRepository<typeof Equipment> {
    constructor() {
        super(Equipment);
    }

    public async getAll(language: Language): Promise<Equipment[]> {
        return Equipment.query()
            .preload('thumbnail')
            .preload('translations', (equipmentTranslationQuery): void => {
                equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                    languageQuery.where('code', language.code);
                });
            })
            .preload('types', (equipmentTypeQuery): void => {
                equipmentTypeQuery.preload('translations', (equipmentTranslationQuery): void => {
                    equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                        languageQuery.where('code', language.code);
                    });
                });
            });
    }

    public async getEquipments(
        language: Language,
        query: string,
        page: number,
        limit: number,
        sortBy: {
            field: `equipments.${keyof Equipment['$attributes']}` | `equipment_translations.${keyof EquipmentTranslation['$attributes']}`;
            order: 'asc' | 'desc';
        }
    ): Promise<PaginatedEquipments> {
        const baseQuery = this.Model.query().select('equipments.*');

        if (query) {
            baseQuery.where((root): void => {
                root.whereHas('translations', (equipmentTranslationQuery): void => {
                    equipmentTranslationQuery.where('name', 'ILIKE', `%${query}%`);
                });
            });
        }

        if (sortBy) {
            const [table, field] = sortBy.field.split('.');

            if (table === 'equipment_translations') {
                baseQuery.orderBy(
                    db
                        .from(table)
                        .whereColumn(`${table}.equipment_id`, 'equipments.id')
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
            .preload('translations', (equipmentTranslationQuery): void => {
                equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                    languageQuery.where('code', language.code);
                });
            })
            .preload('thumbnail');

        const paginator: ModelPaginatorContract<Equipment> = await baseQuery.paginate(page, limit);

        return {
            equipments: paginator.all().map((equipment: Equipment): SerializedEquipmentLight => equipment.apiSerializeLight()),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }

    public async delete(ids: string[], language: Language): Promise<DeleteEquipmentResult[]> {
        return Promise.all(
            ids.map(async (id: string): Promise<DeleteEquipmentResult> => {
                try {
                    const equipment: Equipment = await Equipment.query()
                        .where('id', id)
                        .preload('translations', (equipmentTranslationQuery): void => {
                            equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                                languageQuery.where('code', language.code);
                            });
                        })
                        .firstOrFail();

                    await equipment.delete();

                    return { isDeleted: true, name: equipment.translations[0].name, id };
                } catch (error) {
                    return { isDeleted: false, id };
                }
            })
        );
    }

    public async loadForSerialization(equipment: Equipment, language: Language): Promise<Equipment> {
        await equipment.load('translations', (equipmentTranslationQuery): void => {
            equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                languageQuery.where('code', language.code);
            });
        });

        return equipment;
    }

    public async getOneById(equipmentId: string, language: Language): Promise<Equipment | null> {
        return this.Model.query()
            .where('id', equipmentId)
            .preload('thumbnail')
            .preload('translations', (equipmentTranslationQuery): void => {
                equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                    languageQuery.where('code', language.code);
                });
            })
            .first();
    }

    public async getOneByCategory(category: string, language: Language): Promise<Equipment | null> {
        return this.Model.query()
            .where('category', category)
            .preload('thumbnail')
            .preload('translations', (equipmentTranslationQuery): void => {
                equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                    languageQuery.where('code', language.code);
                });
            })
            .first();
    }
}
