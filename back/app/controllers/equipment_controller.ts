import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import EquipmentRepository from '#repositories/equipment_repository';
import Equipment from '#models/equipment';
import SerializedEquipment from '#types/serialized/serialized_equipment';
import cache from '@adonisjs/cache/services/main';
import { searchEquipmentsValidator } from '#validators/equipment';
import EquipmentTypeRepository from '#repositories/equipment_type_repository';
import PaginatedEquipmentTypes from '#types/paginated/paginated_equipment_types';
import EquipmentType from '#models/equipment_type';
import StringService from '#services/string_service';

@inject()
export default class EquipmentController {
    constructor(
        private readonly equipmentRepository: EquipmentRepository,
        private readonly equipmentTypeRepository: EquipmentTypeRepository,
        private readonly stringService: StringService
    ) {}

    public async getAll({ response, language }: HttpContext) {
        return response.ok(
            await cache.getOrSet({
                key: 'equipments',
                tags: ['equipments'],
                ttl: '24h',
                factory: async (): Promise<SerializedEquipment[]> => {
                    const equipments: Equipment[] = await this.equipmentRepository.getAll(language);

                    return equipments
                        .map((equipment: Equipment): SerializedEquipment => equipment.apiSerialize())
                        .sort((a: SerializedEquipment, b: SerializedEquipment): number => a.name.localeCompare(b.name));
                },
            })
        );
    }

    public async searchEquipments({ request, response, language }: HttpContext) {
        const { query, page, limit, sortBy: inputSortBy } = await request.validateUsing(searchEquipmentsValidator);

        return response.ok(
            await cache.getOrSet({
                key: `equipment-types:query:${query.toLowerCase()}:page:${page}:limit:${limit}:sortBy:${inputSortBy}`,
                tags: ['equipment-types'],
                ttl: '24h',
                factory: async (): Promise<PaginatedEquipmentTypes> => {
                    const [field, order] = inputSortBy.split(':');
                    const sortBy = {
                        field: this.stringService.toSnakeCase(field) as `equipments.${keyof Equipment['$attributes']}` | `equipment_types.${keyof EquipmentType['$attributes']}`,
                        order: order as 'asc' | 'desc',
                    };

                    return await this.equipmentTypeRepository.getEquipments(language, query.toLowerCase(), page, limit, sortBy);
                },
            })
        );
    }
}
