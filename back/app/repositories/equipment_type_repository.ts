import BaseRepository from '#repositories/base/base_repository';
import EquipmentType from '#models/equipment_type';

export default class EquipmentTypeRepository extends BaseRepository<typeof EquipmentType> {
    constructor() {
        super(EquipmentType);
    }
}
