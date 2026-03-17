import SerializedEquipmentLight from '#types/serialized/serialized_equipment_light';

export type PaginatedEquipments = {
    equipments: SerializedEquipmentLight[];
    firstPage: number;
    lastPage: number;
    limit: number;
    total: number;
    currentPage: number;
};

export default PaginatedEquipments;
