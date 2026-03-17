import vine from '@vinejs/vine';
import { FieldContext } from '@vinejs/vine/types';
import Equipment from '#models/equipment';
import EquipmentType from '#models/equipment_type';
import EquipmentTranslation from '#models/equipment_translation';
import EquipmentTypeTranslation from '#models/equipment_type_translation';

const validSortEquipmentTypeFields: string[] = [...EquipmentType.$columnsDefinitions.keys()];
const validSortEquipmentTypeTranslationFields: string[] = [...EquipmentTypeTranslation.$columnsDefinitions.keys()];
const validSortEquipmentFields: string[] = [...Equipment.$columnsDefinitions.keys()];
const validSortEquipmentTranslationFields: string[] = [...EquipmentTranslation.$columnsDefinitions.keys()];

const sortByEquipmentTypeValidator = (value: unknown, _options: any, field: FieldContext): void => {
    if (typeof value !== 'string') return;

    const [fieldName, direction] = value.split(':');

    if (!fieldName || !direction) {
        field.report(`The ${field} format must be "fieldName:asc" or "fieldName:desc"`, 'sortBy', field);
        return;
    }

    if (fieldName.startsWith('equipment_types.')) {
        if (!validSortEquipmentTypeFields.includes(fieldName.replace('equ*ipment_types.', ''))) {
            field.report(`Invalid equipment type field "${field}". Allowed fields: ${validSortEquipmentTypeFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else if (fieldName.startsWith('equipment_type_translations.')) {
        if (!validSortEquipmentTypeTranslationFields.includes(fieldName.replace('equipment_type_translations.', ''))) {
            field.report(`Invalid equipment type translation field "${field}". Allowed fields: ${validSortEquipmentTypeTranslationFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else if (fieldName.startsWith('equipments.')) {
        if (!validSortEquipmentFields.includes(fieldName.replace('equipments.', ''))) {
            field.report(`Invalid equipment field "${field}". Allowed fields: ${validSortEquipmentFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else if (fieldName.startsWith('equipment_translations.')) {
        if (!validSortEquipmentTranslationFields.includes(fieldName.replace('equipment_translations.', ''))) {
            field.report(`Invalid equipment translation field "${field}". Allowed fields: ${validSortEquipmentTranslationFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else {
        field.report(
            `Invalid field prefix : must start with "equipment_types." and be followed by ${[...validSortEquipmentTypeFields, ...validSortEquipmentTypeTranslationFields, ...validSortEquipmentFields, ...validSortEquipmentTranslationFields].join(', ')}`,
            'sortBy',
            field
        );
        return;
    }

    if (direction !== 'asc' && direction !== 'desc') {
        field.report(`Invalid sort direction "${field}". Must be "asc" or "desc"`, 'sortBy', field);
    }
};

export const sortByEquipmentTypeRule = vine.createRule(sortByEquipmentTypeValidator);
