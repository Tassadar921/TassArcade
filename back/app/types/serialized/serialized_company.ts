import SerializedAddress from '#types/serialized/serialized_address';
import SerializedEquipmentType from '#types/serialized/serialized_equipment_type';

export type SerializedCompany = {
    id: string;
    name: string;
    address: SerializedAddress;
    equipments: SerializedEquipmentType[];
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedCompany;
