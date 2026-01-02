import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import EquipmentRepository from '#repositories/equipment_repository';
import Equipment from '#models/equipment';
import SerializedEquipment from '#types/serialized/serialized_equipment';
import cache from '@adonisjs/cache/services/main';
import PaginatedEquipments from '#types/paginated/paginated_equipments';
import { searchEquipmentsValidator } from '#validators/equipment';
import EquipmentTypeRepository from '#repositories/equipment_type_repository';

@inject()
export default class EquipmentController {
    constructor(
        private readonly equipmentRepository: EquipmentRepository,
        private readonly equipmentTypeRepository: EquipmentTypeRepository
    ) {}

    public async getAll({ response, language }: HttpContext): Promise<void> {
        return response.ok(
            await cache.getOrSet({
                key: 'equipments',
                tags: ['equipments'],
                ttl: '24h',
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
        const { query, page, limit } = await request.validateUsing(searchEquipmentsValidator);

        return response.ok(
            await cache.getOrSet({
                key: `company-search-equipments:query:${query.toLowerCase()}:page:${page}:limit:${limit}`,
                tags: ['company-search-equipments'],
                ttl: '24h',
                factory: async (): Promise<PaginatedEquipments> => {
                    return await this.equipmentTypeRepository.getEquipments(language, query.toLowerCase(), page, limit);
                },
            })
        );
    }
}
