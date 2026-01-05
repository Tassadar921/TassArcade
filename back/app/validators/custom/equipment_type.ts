import vine from '@vinejs/vine';
import { FieldContext } from '@vinejs/vine/types';
import Equipment from '#models/equipment';
import EquipmentType from '#models/equipment_type';

const validSortFields: string[] = [...Equipment.$columnsDefinitions.keys(), ...EquipmentType.$columnsDefinitions.keys()];

const sortByEquipmentTypeValidator = (value: unknown, _options: any, field: FieldContext): void => {
    if (typeof value !== 'string') return;

    const [fieldName, direction] = value.split(':');

    if (!fieldName || !direction) {
        field.report(`The ${field} format must be "fieldName:asc" or "fieldName:desc"`, 'sortBy', field);
        return;
    }

    if (fieldName.startsWith('equipment_types.')) {
        if (!validSortFields.includes(fieldName.replace('equipment_types.', ''))) {
            field.report(`Invalid equipment type field "${field}". Allowed fields: ${validSortFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else {
        field.report(`Invalid field prefix : must start with "equipment_types." be followed by ${validSortFields.join(', ')}`, 'sortBy', field);
        return;
    }

    if (direction !== 'asc' && direction !== 'desc') {
        field.report(`Invalid sort direction "${field}". Must be "asc" or "desc"`, 'sortBy', field);
    }
};

export const sortByEquipmentTypeRule = vine.createRule(sortByEquipmentTypeValidator);
