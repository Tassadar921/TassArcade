import SerializedLanguage from '#types/serialized/serialized_language';

export type SerializedEquipmentTypeTranslation = {
    id: string;
    name: string;
    language: SerializedLanguage;
    updatedAt?: string;
    createdAt?: string;
};

export default SerializedEquipmentTypeTranslation;
