import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';

export type PaginatedCompanyEquipmentTypes = {
    equipmentTypes: SerializedCompanyEquipmentType[];
    firstPage: number;
    lastPage: number;
    limit: number;
    total: number;
    currentPage: number;
};

export default PaginatedCompanyEquipmentTypes;
