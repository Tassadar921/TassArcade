import BaseRepository from '#repositories/base/base_repository';
import Equipment from '#models/equipment';
import Language from '#models/language';

export default class EquipmentRepository extends BaseRepository<typeof Equipment> {
    constructor() {
        super(Equipment);
    }

    public async getAll(language: Language): Promise<Equipment[]> {
        return this.Model.query().preload('translations', (query) => {
            query.where('language_id', language.id);
        });
    }
}
