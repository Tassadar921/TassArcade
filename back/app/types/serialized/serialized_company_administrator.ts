import CompanyAdministratorEnum from '#types/enum/company_administrator_enum';
import SerializedUser from '#types/serialized/serialized_user';

export type SerializedCompanyAdministrator = {
    id: number;
    type: CompanyAdministratorEnum;
    user: SerializedUser;
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedCompanyAdministrator;
