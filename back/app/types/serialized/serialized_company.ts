import SerializedAddress from '#types/serialized/serialized_address';
import SerializedCompanyAdministrator from '#types/serialized/serialized_company_administrator';

export type SerializedCompany = {
    id: string;
    name: string;
    address: SerializedAddress;
    administrators: SerializedCompanyAdministrator[];
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedCompany;
