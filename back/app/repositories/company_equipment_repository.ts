import BaseRepository from '#repositories/base/base_repository';
import CompanyEquipment from '#models/company_equipment_type';

export default class CompanyEquipmentRepository extends BaseRepository<typeof CompanyEquipment> {
    constructor() {
        super(CompanyEquipment);
    }
}
