import SerializedFile from '#types/serialized/serialized_file';

export type SerializedEquipmentLight = {
    id: string;
    name: string;
    category: string;
    thumbnail: SerializedFile;
    updatedAt?: string;
    createdAt?: string;
};

export default SerializedEquipmentLight;
