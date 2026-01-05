import vine from '@vinejs/vine';
import { FieldContext } from '@vinejs/vine/types';
import CompanyEquipmentType from '#models/company_equipment_type';
import EquipmentType from '#models/equipment_type';

const validSortFields: string[] = [...CompanyEquipmentType.$columnsDefinitions.keys(), ...EquipmentType.$columnsDefinitions.keys(), ...CompanyEquipmentType.$columnsDefinitions.keys()];

const sortByCompanyEquipmentValidator = (value: unknown, _options: any, field: FieldContext): void => {
    if (typeof value !== 'string') return;

    const [fieldName, direction] = value.split(':');

    if (!fieldName || !direction) {
        field.report(`The ${field} format must be "fieldName:asc" or "fieldName:desc"`, 'sortBy', field);
        return;
    }

    if (fieldName.startsWith('company_equipments.')) {
        if (!validSortFields.includes(fieldName.replace('company_equipments.', ''))) {
            field.report(`Invalid company equipment field "${field}". Allowed fields: ${validSortFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else {
        field.report(`Invalid field prefix : must start with "company_equipments." and be followed by ${validSortFields.join(', ')}`, 'sortBy', field);
        return;
    }

    if (direction !== 'asc' && direction !== 'desc') {
        field.report(`Invalid sort direction "${field}". Must be "asc" or "desc"`, 'sortBy', field);
    }
};

export const sortByCompanyEquipmentRule = vine.createRule(sortByCompanyEquipmentValidator);
