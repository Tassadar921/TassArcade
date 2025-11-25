import SerializedAddress from '#types/serialized/serialized_address';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';
import SerializedFile from '#types/serialized/serialized_file';

export type SerializedCompanyLight = {
    id: string;
    name: string;
    phoneNumber?: string;
    logo?: SerializedFile;
    address: SerializedAddress;
    equipments: SerializedCompanyEquipmentType[];
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedCompanyLight;
