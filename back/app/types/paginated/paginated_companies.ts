import SerializedCompany from '#types/serialized/serialized_company';

export type PaginatedCompanies = {
    companies: SerializedCompany[];
    firstPage: number;
    lastPage: number;
    limit: number;
    total: number;
    currentPage: number;
};

export default PaginatedCompanies;
