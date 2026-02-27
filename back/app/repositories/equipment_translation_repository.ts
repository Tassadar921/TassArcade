import BaseRepository from '#repositories/base/base_repository';
import EquipmentTranslation from '#models/equipment_translation';
import Equipment from '#models/equipment';
import type { SupportedLocale } from '#config/i18n';

export default class EquipmentTranslationRepository extends BaseRepository<typeof EquipmentTranslation> {
    constructor() {
        super(EquipmentTranslation);
    }

    public async getFromEquipmentAndLanguageCode(equipment: Equipment, languageCode: SupportedLocale): Promise<EquipmentTranslation | null> {
        return this.Model.query()
            .select('equipment_translations')
            .leftJoin('languages', 'equipment_translations.language_id', 'languages.id')
            .where('languages.code', languageCode)
            .andWhere('equipment_translations.equipment_id', equipment.id)
            .first();
    }

    public async getAllFromEquipment(equipment: Equipment): Promise<EquipmentTranslation[]> {
        return this.Model.query()
            .where('equipment_id', equipment.id)
            .preload('language', (languageQuery): void => {
                languageQuery.preload('flag');
            });
    }
}
