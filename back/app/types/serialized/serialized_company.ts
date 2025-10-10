import SerializedAddress from '#types/serialized/serialized_address';
import SerializedCompanyEquipmentType from '#types/serialized/serialized_company_equipment_type';

export type SerializedCompany = {
    id: string;
    name: string;
    address: SerializedAddress;
    equipments: SerializedCompanyEquipmentType[];
    createdAt?: string;
    updatedAt?: string;
};

export default SerializedCompany;
