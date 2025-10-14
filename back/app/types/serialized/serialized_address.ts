export type SerializedAddress = {
    id: string;
    address: string;
    zipCode: string;
    city: string;
    complement: string;
    country: string;
    fullAddress: string;
    encodedAddress: string;
    latitude: number;
    longitude: number;
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedAddress;
