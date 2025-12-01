import BaseRepository from '#repositories/base/base_repository';
import CompanyEquipmentType from '#models/company_equipment_type';
import Company from '#models/company';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import Language from '#models/language';

export default class CompanyEquipmentTypeRepository extends BaseRepository<typeof CompanyEquipmentType> {
    constructor() {
        super(CompanyEquipmentType);
    }

    public async getCompanyEquipments(company: Company, language: Language): Promise<SerializedCompanyEquipmentType[]> {
        const equipments: CompanyEquipmentType[] = await this.Model.query()
            .select('company_equipment_types.*')
            .leftJoin('equipment_types', 'company_equipment_types.equipment_type_id', 'equipment_types.id')
            .leftJoin('equipments', 'equipment_types.equipment_id', 'equipments.id')
            .where('company_equipment_types.company_id', company.id)
            .preload('equipmentType');

        return equipments.map((equipmentType: CompanyEquipmentType): SerializedCompanyEquipmentType => equipmentType.apiSerialize(language));
    }
}
