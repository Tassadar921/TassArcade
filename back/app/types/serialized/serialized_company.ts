import SerializedAddress from '#types/serialized/serialized_address';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import SerializedFile from '#types/serialized/serialized_file';

export type SerializedCompany = {
    id: string;
    siret: string;
    name: string;
    phoneNumber?: string;
    email?: string;
    enabled: boolean;
    logo?: SerializedFile;
    address: SerializedAddress;
    equipments: SerializedCompanyEquipmentType[];
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedCompany;
