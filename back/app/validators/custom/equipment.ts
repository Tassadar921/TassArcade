import vine from '@vinejs/vine';
import { FieldContext } from '@vinejs/vine/types';
import Equipment from '#models/equipment';
import EquipmentTranslation from '#models/equipment_translation';

const validEquipmentSortFields: string[] = [...Equipment.$columnsDefinitions.keys()];
const validEquipmentTranslationSortFields: string[] = [...EquipmentTranslation.$columnsDefinitions.keys()];

const sortByEquipmentValidator = (value: unknown, _options: any, field: FieldContext): void => {
    if (typeof value !== 'string') return;

    console.log(value);

    const [fieldName, direction] = value.split(':');

    if (!fieldName || !direction) {
        field.report(`The ${field} format must be "fieldName:asc" or "fieldName:desc"`, 'sortBy', field);
        return;
    }

    if (fieldName.startsWith('equipments.')) {
        if (!validEquipmentSortFields.includes(fieldName.replace('equipments.', ''))) {
            field.report(`Invalid equipment field "${field}". Allowed fields: ${validEquipmentSortFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else if (fieldName.startsWith('equipment_translations.')) {
        if (!validEquipmentTranslationSortFields.includes(fieldName.replace('equipment_translations.', ''))) {
            field.report(`Invalid equipment translation field "${field}". Allowed fields: ${validEquipmentTranslationSortFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else {
        field.report(
            `Invalid field prefix : must start with "equipments." or "equipment_translations." and be followed respectively by ${validEquipmentSortFields.join(', ')} and ${validEquipmentTranslationSortFields.join(', ')}`,
            'sortBy',
            field
        );
        return;
    }

    if (direction !== 'asc' && direction !== 'desc') {
        field.report(`Invalid sort direction "${field}". Must be "asc" or "desc"`, 'sortBy', field);
    }
};

export const sortByEquipmentRule = vine.createRule(sortByEquipmentValidator);
