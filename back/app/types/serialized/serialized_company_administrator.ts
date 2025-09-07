import SerializedUser from '#types/serialized/serialized_user';
import CompanyAdministratorRoleEnum from '#types/enum/company_administrator_role_enum';

export type SerializedCompanyAdministrator = {
    id: number;
    role: CompanyAdministratorRoleEnum;
    user: SerializedUser;
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedCompanyAdministrator;
