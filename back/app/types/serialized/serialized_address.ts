export type SerializedAddress = {
    id: number;
    streetNumber: string;
    isBis: boolean;
    street: string;
    zipCode: string;
    city: string;
    complement: string;
    country: string;
    fullAddress: string;
    encodedAddress: string;
    latitude: number | null;
    longitude: number | null;
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedAddress;
