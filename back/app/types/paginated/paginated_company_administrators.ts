import SerializedCompanyAdministrator from '#types/serialized/serialized_company_administrator';

export type PaginatedCompanyAdministrators = {
    administrators: SerializedCompanyAdministrator[];
    firstPage: number;
    lastPage: number;
    limit: number;
    total: number;
    currentPage: number;
};

export default PaginatedCompanyAdministrators;
