import BaseRepository from '#repositories/base/base_repository';
import EquipmentTypeTranslation from '#models/equipment_type_translation';

export default class EquipmentTypeTranslationRepository extends BaseRepository<typeof EquipmentTypeTranslation> {
    constructor() {
        super(EquipmentTypeTranslation);
    }
}
