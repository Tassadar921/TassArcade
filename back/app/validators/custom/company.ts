import vine from '@vinejs/vine';
import { FieldContext } from '@vinejs/vine/types';
import Company from '#models/company';

const validSortCompanyFields: string[] = [...Company.$columnsDefinitions.keys()];

const sortByCompanyValidator = (value: unknown, _options: any, field: FieldContext): void => {
    if (typeof value !== 'string') return;

    const [fieldName, direction] = value.split(':');

    if (!fieldName || !direction) {
        field.report(`The ${field} format must be "fieldName:asc" or "fieldName:desc"`, 'sortBy', field);
        return;
    }

    if (fieldName.startsWith('companies.')) {
        if (!validSortCompanyFields.includes(fieldName.replace('companies.', ''))) {
            field.report(`Invalid user field "${field}". Allowed fields: ${validSortCompanyFields.join(', ')}`, 'sortBy', field);
            return;
        }
    } else {
        field.report(`Invalid field prefix : must start with "companies." be followed by ${validSortCompanyFields.join(', ')}`, 'sortBy', field);
        return;
    }

    if (direction !== 'asc' && direction !== 'desc') {
        field.report(`Invalid sort direction "${field}". Must be "asc" or "desc"`, 'sortBy', field);
    }
};

export const sortByCompanyRule = vine.createRule(sortByCompanyValidator);
