import BaseRepository from '#repositories/base/base_repository';
import Equipment from '#models/equipment';
import Language from '#models/language';
import SerializedEquipment from '#types/serialized/serialized_equipment';
import PaginatedEquipments from '#types/paginated/paginated_equipments';
import EquipmentType from '#models/equipment_type';
import { ModelPaginatorContract, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model';

export default class EquipmentRepository extends BaseRepository<typeof Equipment> {
    constructor() {
        super(Equipment);
    }

    public async getEquipments(language: Language): Promise<SerializedEquipment[]> {
        const equipments: Equipment[] = await this.all(['types']);
        return equipments.map((equipment: Equipment): SerializedEquipment => equipment.apiSerialize(language));
    }

    public async getPaginatedEquipments(
        language: Language,
        query: string,
        page: number,
        limit: number,
        sortBy: { field: keyof Equipment['$attributes'] | `users.${keyof EquipmentType['$attributes']}`; order: 'asc' | 'desc' }
    ): Promise<PaginatedEquipments> {
        const paginator: ModelPaginatorContract<Equipment> = await this.Model.query()
            .select('equipments.*')
            .leftJoin('equipment_types', 'equipments.id', 'equipment_types.equipment_id')
            .if(query, (queryBuilder: ModelQueryBuilderContract<typeof Equipment>): void => {
                queryBuilder.where((subQuery: ModelQueryBuilderContract<typeof EquipmentType>): void => {
                    subQuery.where('equipments.category', 'ILIKE', `%${query}%`);
                });
            })
            .if(sortBy, (queryBuilder: ModelQueryBuilderContract<typeof Equipment>): void => {
                queryBuilder.orderBy(sortBy.field as string, sortBy.order);
            })
            .preload('thumbnail')
            .preload('types')
            .paginate(page, limit);

        return {
            equipments: paginator.all().map((equipment: Equipment): SerializedEquipment => equipment.apiSerialize(language)),
            firstPage: paginator.firstPage,
            lastPage: paginator.lastPage,
            limit,
            total: paginator.total,
            currentPage: paginator.currentPage,
        };
    }
}
