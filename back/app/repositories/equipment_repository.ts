import BaseRepository from '#repositories/base/base_repository';
import Equipment from '#models/equipment';

export default class EquipmentRepository extends BaseRepository<typeof Equipment> {
    constructor() {
        super(Equipment);
    }
}
