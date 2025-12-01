import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import EquipmentRepository from '#repositories/equipment_repository';
import Equipment from '#models/equipment';
import SerializedEquipment from '#types/serialized/serialized_equipment';
import cache from '@adonisjs/cache/services/main';
import PaginatedEquipments from '#types/paginated/paginated_equipments';
import EquipmentType from '#models/equipment_type';
import { searchEquipmentsValidator } from '#validators/equipment';

@inject()
export default class EquipmentController {
    constructor(private readonly equipmentRepository: EquipmentRepository) {}

    public async getAll({ response, language }: HttpContext): Promise<void> {
        return response.ok(
            await cache.getOrSet({
                key: 'equipments',
                tags: ['equipments'],
                ttl: '1h',
                factory: async (): Promise<SerializedEquipment[]> => {
                    const equipments: Equipment[] = await this.equipmentRepository.all(['types']);

                    return equipments
                        .map((equipment: Equipment): SerializedEquipment => equipment.apiSerialize(language))
                        .sort((a: SerializedEquipment, b: SerializedEquipment): number => a.name.localeCompare(b.name));
                },
            })
        );
    }

    public async searchEquipments({ request, response, language }: HttpContext) {
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchEquipmentsValidator);

        return response.ok(
            await cache.getOrSet({
                key: `company-search-equipments:query:${query.toLowerCase()}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: ['company-search-equipments'],
                ttl: '24h',
                factory: async (): Promise<PaginatedEquipments> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = { field: field as keyof Equipment['$attributes'] | keyof EquipmentType['$attributes'], order: order as 'asc' | 'desc' };

                    return await this.equipmentRepository.getPaginatedEquipments(language, query.toLowerCase(), page, limit, sortBy);
                },
            })
        );
    }
}
