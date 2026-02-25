import BaseRepository from '#repositories/base/base_repository';
import Equipment from '#models/equipment';
import Language from '#models/language';
import db from '@adonisjs/lucid/services/db';
import { DeleteEquipmentResult } from '#types/serialized/delete_equipment_result';
import EquipmentType from '#models/equipment_type';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import PaginatedEquipments from '#types/paginated/paginated_equipments';
import SerializedEquipmentLight from '#types/serialized/serialized_equipment_light';

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
            field: `equipments.${keyof Equipment['$attributes']}` | `equipment_types.${keyof EquipmentType['$attributes']}`;
            order: 'asc' | 'desc';
        }
    ): Promise<PaginatedEquipments> {
        const baseQuery = this.Model.query();

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
                    console.log(error);
                    return { isDeleted: false, id };
                }
            })
        );
    }
}
