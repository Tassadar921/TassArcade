import BaseRepository from '#repositories/base/base_repository';
import Equipment from '#models/equipment';
import Language from '#models/language';

export default class EquipmentRepository extends BaseRepository<typeof Equipment> {
    constructor() {
        super(Equipment);
    }

    public async getAll(language: Language): Promise<Equipment[]> {
        return Equipment.query()
            .preload('thumbnail')
            .preload('translations', (equipmentTranslationQuery): void => {
                equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                    languageQuery.where('code', language.code);
                });
            })
            .preload('types', (equipmentTypeQuery): void => {
                equipmentTypeQuery.preload('translations', (equipmentTranslationQuery): void => {
                    equipmentTranslationQuery.whereHas('language', (languageQuery): void => {
                        languageQuery.where('code', language.code);
                    });
                });
            });
    }
}
