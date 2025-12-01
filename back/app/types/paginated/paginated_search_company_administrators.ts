import SearchCompanyAdministrator from '#types/search_company_administrator';

export type PaginatedSearchCompanyAdministrators = {
    users: SearchCompanyAdministrator[];
    firstPage: number;
    lastPage: number;
    limit: number;
    total: number;
    currentPage: number;
};

export default PaginatedSearchCompanyAdministrators;
