import SerializedUser from '#types/serialized/serialized_user';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';

export type SearchCompanyAdministrator = {
    user: SerializedUser;
    isAdministrator: boolean;
    role?: CompanyAdministratorRoleEnum;
};

export default SearchCompanyAdministrator;
