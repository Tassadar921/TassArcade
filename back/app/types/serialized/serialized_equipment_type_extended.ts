import SerializedEquipmentLight from '#types/serialized/serialized_equipment_light';

export type SerializedEquipmentTypeExtended = {
    id: string;
    code: string;
    name: string;
    equipment: SerializedEquipmentLight;
    updatedAt?: string;
    createdAt?: string;
};

export default SerializedEquipmentTypeExtended;
