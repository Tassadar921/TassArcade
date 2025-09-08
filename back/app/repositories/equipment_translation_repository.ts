import BaseRepository from '#repositories/base/base_repository';
import EquipmentTranslation from '#models/equipment_translation';

export default class EquipmentTranslationRepository extends BaseRepository<typeof EquipmentTranslation> {
    constructor() {
        super(EquipmentTranslation);
    }
}
