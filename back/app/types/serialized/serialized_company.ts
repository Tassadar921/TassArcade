import SerializedAddress from '#types/serialized/serialized_address';

export type SerializedCompany = {
    id: string;
    name: string;
    address: SerializedAddress;
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedCompany;
