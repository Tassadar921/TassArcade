import vine from '@vinejs/vine';
import { FieldContext } from '@vinejs/vine/types';
import User from '#models/user';
import CompanyAdministrator from '#models/company_administrator';

const validSortUserFields: string[] = [...User.$columnsDefinitions.keys()];
const validSortCompanyAdministratorFields: string[] = [...CompanyAdministrator.$columnsDefinitions.keys()];

const sortByCompanyAdministratorValidator = (value: unknown, _options: any, field: FieldContext): void => {
    if (typeof value !== 'string') return;

    const [fieldName, direction] = value.split(':');

    if (!fieldName || !direction) {
        field.report('The {{ field }} format must be "fieldName:asc" or "fieldName:desc"', 'sortBy', field);
        return;
    }

    if (!validSortCompanyAdministratorFields.includes(fieldName)) {
        if (fieldName.startsWith('users.')) {
            if (!validSortUserFields.includes(fieldName.replace('users.', ''))) {
                field.report(`Invalid user field "{{ field }}". Allowed fields: ${validSortUserFields.join(', ')}`, 'sortBy', field);
                return;
            }
        } else {
            field.report(`Invalid company administrator field "{{ field }}". Allowed fields: ${validSortCompanyAdministratorFields.join(', ')}`, 'sortBy', field);
            return;
        }
    }

    if (direction !== 'asc' && direction !== 'desc') {
        field.report(`Invalid sort direction "{{ field }}". Must be "asc" or "desc"`, 'sortBy', field);
    }
};

export const sortByCompanyAdministratorRule = vine.createRule(sortByCompanyAdministratorValidator);
