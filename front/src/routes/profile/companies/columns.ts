import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import type { SerializedCompany } from 'backend/types';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { SortableColumn, DataTableActions } from '#lib/components/ui/data-table';

export const getCompanyColumns = (onSort: (field: string, order: 'asc' | 'desc') => void): ColumnDef<SerializedCompany>[] => [
    {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) =>
            renderComponent(SortableColumn, {
                title: m['company.fields.name'](),
                field: 'name',
                onclick: onSort,
            }),
        enableHiding: false,
    },
    {
        id: 'phoneNumber',
        accessorKey: 'phoneNumber',
        meta: {
            headerName: m['company.fields.phone-number'](),
        },
        header: ({ column }) =>
            renderComponent(SortableColumn, {
                title: m['company.fields.phone-number'](),
                field: 'phoneNumber',
                onclick: onSort,
            }),
    },
    {
        header: m['common.datatable.actions'](),
        enableHiding: false,
        cell: ({ row }) =>
            renderComponent(DataTableActions, {
                id: row.original.id,
            }),
    },
];
