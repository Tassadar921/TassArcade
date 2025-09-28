import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import EquipmentRepository from '#repositories/equipment_repository';
import Equipment from '#models/equipment';
import SerializedEquipment from '#types/serialized/serialized_equipment';

@inject()
export default class EquipmentController {
    constructor(private readonly equipmentRepository: EquipmentRepository) {}

    public async getAll({ response, language }: HttpContext): Promise<void> {
        const equipments: Equipment[] = await this.equipmentRepository.all(['thumbnail', 'types']);

        return response.ok(equipments.map((equipment: Equipment): SerializedEquipment => equipment.apiSerialize(language)));
    }
}
