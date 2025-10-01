import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import EquipmentRepository from '#repositories/equipment_repository';
import Equipment from '#models/equipment';
import SerializedEquipment from '#types/serialized/serialized_equipment';
import cache from '@adonisjs/cache/services/main';

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
}
