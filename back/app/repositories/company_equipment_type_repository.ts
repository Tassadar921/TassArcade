import BaseRepository from '#repositories/base/base_repository';
import CompanyEquipmentType from '#models/company_equipment_type';

export default class CompanyEquipmentTypeRepository extends BaseRepository<typeof CompanyEquipmentType> {
    constructor() {
        super(CompanyEquipmentType);
    }
}
