import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import EquipmentRepository from '#repositories/equipment_repository';
import Equipment from '#models/equipment';

@inject()
export default class EquipmentController {
    constructor(private readonly equipmentRepository: EquipmentRepository) {}

    public async getAll({ response, language }: HttpContext) {
        const equipments: Equipment[] = await this.equipmentRepository.getAll(language);

        console.log(equipments[0]);

        return response.json([]);
    }
}
