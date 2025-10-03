import SerializedCompany from '#types/serialized/serialized_company';

export type Cluster = {
    id: string;
    lat: number;
    lng: number;
    isCluster: boolean;
    companies: SerializedCompany[];
};
