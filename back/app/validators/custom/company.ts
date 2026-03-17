import vine from '@vinejs/vine';
import { FieldContext } from '@vinejs/vine/types';
import Company from '#models/company';

const validSortFields: string[] = [...Company.$columnsDefinitions.keys()];

const sortByCompanyValidator = (value: unknown, _options: any, field: FieldContext): void => {
    if (typeof value !== 'string') return;

    const [fieldName, direction] = value.split(':');

    if (!fieldName || !direction) {
        field.report(`The ${field} format must be "fieldName:asc" or "fieldName:desc"`, 'sortBy', field);
        return;
    }

    if (fieldName.startsWith('companies.')) {
        if (!validSortFields.includes(fieldName.replace('companies.', ''))) {
            field.report(`Invalid company field "${field}". Allowed fields: ${validSortFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else {
        field.report(`Invalid field prefix : must start with "companies." and be followed by ${validSortFields.join(', ')}`, 'sortBy', field);
        return;
    }

    if (direction !== 'asc' && direction !== 'desc') {
        field.report(`Invalid sort direction "${field}". Must be "asc" or "desc"`, 'sortBy', field);
    }
};

export const sortByCompanyRule = vine.createRule(sortByCompanyValidator);
