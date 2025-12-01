import SerializedEquipment from '#types/serialized/serialized_equipment';

export type PaginatedEquipments = {
    equipments: SerializedEquipment[];
    firstPage: number;
    lastPage: number;
    limit: number;
    total: number;
    currentPage: number;
};

export default PaginatedEquipments;
