import SerializedFile from '#types/serialized/serialized_file';

export type SerializedLanguage = {
    name: string;
    code: string;
    flag: SerializedFile;
};

export default SerializedLanguage;
