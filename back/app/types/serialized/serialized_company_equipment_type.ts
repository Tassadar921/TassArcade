import SerializedEquipmentLight from '#types/serialized/serialized_equipment_light';

export type SerializedCompanyEquipmentType = {
    id: string;
    category: SerializedEquipmentLight;
    name: string;
    description?: string;
    updatedAt?: string;
    createdAt?: string;
};

export default SerializedCompanyEquipmentType;
