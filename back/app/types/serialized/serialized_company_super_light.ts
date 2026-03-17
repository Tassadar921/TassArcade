import SerializedAddress from '#types/serialized/serialized_address';
import SerializedFile from '#types/serialized/serialized_file';

export type SerializedCompanySuperLight = {
    id: string;
    name: string;
    phoneNumber?: string;
    enabled: boolean;
    logo?: SerializedFile;
    address: SerializedAddress;
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedCompanySuperLight;
