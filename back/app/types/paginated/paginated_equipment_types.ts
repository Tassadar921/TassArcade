import SerializedEquipmentTypeExtended from '#types/serialized/serialized_equipment_type_extended';

export type PaginatedEquipmentTypes = {
    equipments: SerializedEquipmentTypeExtended[];
    firstPage: number;
    lastPage: number;
    limit: number;
    total: number;
    currentPage: number;
};

export default PaginatedEquipmentTypes;
