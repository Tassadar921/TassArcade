import SerializedFile from '#types/serialized/serialized_file';
import SerializedEquipmentType from '#types/serialized/serialized_equipment_type';

export type SerializedEquipment = {
    id: string;
    name: string;
    category: string;
    thumbnail: SerializedFile;
    types: SerializedEquipmentType[];
    updatedAt?: string;
    createdAt?: string;
};

export default SerializedEquipment;
