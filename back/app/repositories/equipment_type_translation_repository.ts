import BaseRepository from '#repositories/base/base_repository';
import EquipmentTypeTranslation from '#models/equipment_type_translation';
import EquipmentType from '#models/equipment_type';
import type { SupportedLocale } from '#config/i18n';

export default class EquipmentTypeTranslationRepository extends BaseRepository<typeof EquipmentTypeTranslation> {
    constructor() {
        super(EquipmentTypeTranslation);
    }

    public async getFromEquipmentTypeAndLanguageCode(equipmentType: EquipmentType, languageCode: SupportedLocale): Promise<EquipmentTypeTranslation | null> {
        return this.Model.query()
            .where('equipment_type_id', equipmentType.id)
            .whereHas('language', (query): void => {
                query.where('code', languageCode);
            })
            .first();
    }

    public async getAllFromEquipmentType(equipmentType: EquipmentType): Promise<EquipmentTypeTranslation[]> {
        return this.Model.query()
            .where('equipment_type_id', equipmentType.id)
            .preload('language', (languageQuery): void => {
                languageQuery.preload('flag');
            });
    }
}
