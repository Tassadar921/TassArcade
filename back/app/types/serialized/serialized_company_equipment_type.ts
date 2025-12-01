import SerializedEquipmentLight from '#types/serialized/serialized_equipment_light';
import SerializedEquipmentType from '#types/serialized/serialized_equipment_type';

export type SerializedCompanyEquipmentType = {
    id: string;
    category: SerializedEquipmentLight;
    type: SerializedEquipmentType;
    name: string;
    description?: string;
    updatedAt?: string;
    createdAt?: string;
};

export default SerializedCompanyEquipmentType;
