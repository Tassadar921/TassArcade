import SerializedCompanyLight from '#types/serialized/serialized_company_light';

export type Cluster = {
    id: string;
    lat: number;
    lng: number;
    isCluster: boolean;
    companies: SerializedCompanyLight[];
};
