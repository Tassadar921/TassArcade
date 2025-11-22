import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { SortableColumn, DataTableActions } from '#lib/components/ui/data-table';
import type { SerializedCompanyAdministrator } from 'backend/types';
import { Checkbox } from '#lib/components/ui/checkbox';

export const getUserColumns = (onSort: (field: string, order: 'asc' | 'desc') => void): ColumnDef<SerializedCompanyAdministrator>[] => [
    {
        id: 'select',
        header: ({ table }) =>
            renderComponent(Checkbox, {
                checked: table.getIsAllPageRowsSelected(),
                indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
                onCheckedChange: (value: boolean): void => table.toggleAllPageRowsSelected(value),
                'aria-label': m['common.datatable.select.all'](),
            }),
        cell: ({ row }) =>
            renderComponent(Checkbox, {
                checked: row.getIsSelected(),
                'aria-label': m['common.datatable.select.row'](),
            }),
        enableHiding: false,
    },
    {
        id: 'username',
        accessorKey: 'user.username',
        header: () =>
            renderComponent(SortableColumn, {
                title: m['common.username.label'](),
                field: 'user.username',
                onclick: onSort,
            }),
        enableHiding: false,
    },
    {
        id: 'email',
        accessorKey: 'user.email',
        header: () =>
            renderComponent(SortableColumn, {
                title: m['common.email.label'](),
                field: 'user.email',
                onclick: onSort,
            }),
        enableHiding: false,
    },
    {
        id: 'role',
        accessorKey: 'role',
        meta: {
            headerName: m['company.edit.administrators.fields.role'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['company.edit.administrators.fields.role'](),
                field: 'role',
                onclick: onSort,
            }),
    },
    {
        header: m['common.datatable.actions'](),
        enableHiding: false,
        cell: ({ row }) =>
            renderComponent(DataTableActions, {
                id: row.original.user.id,
            }),
    },
];
