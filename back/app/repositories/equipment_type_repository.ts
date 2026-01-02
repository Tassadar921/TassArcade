import BaseRepository from '#repositories/base/base_repository';
import EquipmentType from '#models/equipment_type';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';
import PaginatedEquipmentTypes from '#types/paginated/paginated_equipment_types';
import Language from '#models/language';
import SerializedEquipmentTypeExtended from '#types/serialized/serialized_equipment_type_extended';
import Equipment from '#models/equipment';

export default class EquipmentTypeRepository extends BaseRepository<typeof EquipmentType> {
    constructor() {
        super(EquipmentType);
    }

    public async getEquipments(language: Language, query: string, page: number, limit: number): Promise<PaginatedEquipmentTypes> {
        const paginator: ModelPaginatorContract<EquipmentType> = await this.Model.query()
            .select('equipments.*')
            .leftJoin('equipments', 'equipment_types.equipment_id', 'equipments.id')
            .if(query, (queryBuilder: ModelQueryBuilderContract<typeof EquipmentType>): void => {
                queryBuilder.where((subQuery: ModelQueryBuilderContract<typeof EquipmentType>): void => {
                    subQuery
                        .whereRaw(`name->>'${language.code}' ILIKE ?`, [`%${query}%`])
                        .orWhere('equipments.category', 'ILIKE', `%${query}%`)
                        .orWhere('equipment_types.name', 'ILIKE', `%${query}%`)
                        .orWhere('equipment_types.code', 'ILIKE', `%${query}%`);
                });
            })
            .preload('equipment', (equipmentQuery: ModelQueryBuilderContract<typeof Equipment>): void => {
                equipmentQuery.preload('thumbnail');
            })
            .paginate(page, limit);

        return {
            equipments: paginator.all().map((equipment: EquipmentType): SerializedEquipmentTypeExtended => equipment.apiSerializeExtended(language)),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }
}
