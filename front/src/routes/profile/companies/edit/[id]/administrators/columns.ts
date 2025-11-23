import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { DataTableActions, SortableColumn } from '#lib/components/ui/data-table';
import type { SearchCompanyAdministrator, SerializedCompanyAdministrator } from 'backend/types';
import { Checkbox } from '#lib/components/ui/checkbox';
import DatatableSearchCompanyAdministratorAction from '#lib/partials/profile/company/administrators/DatatableSearchCompanyAdministratorAction.svelte';

export const getCompanyAdministratorsColumns = (onSort: (field: string, order: 'asc' | 'desc') => void): ColumnDef<SerializedCompanyAdministrator>[] => [
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
                field: 'users.username',
                onclick: onSort,
            }),
        enableHiding: false,
    },
    {
        id: 'email',
        accessorKey: 'user.email',
        meta: {
            headerName: m['common.email.label'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['common.email.label'](),
                field: 'users.email',
                onclick: onSort,
            }),
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
];

export const getSearchCompanyAdministratorsColumns = (
    onSort: (field: string, order: 'asc' | 'desc') => void,
    addAdministrator: (userId: string) => void,
    removeAdministrator: (userId: string) => void
): ColumnDef<SearchCompanyAdministrator>[] => [
    {
        id: 'username',
        accessorKey: 'user.username',
        header: () =>
            renderComponent(SortableColumn, {
                title: m['common.username.label'](),
                field: 'username',
                onclick: onSort,
            }),
        enableHiding: false,
    },
    {
        id: 'email',
        accessorKey: 'user.email',
        meta: {
            headerName: m['common.email.label'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['common.email.label'](),
                field: 'email',
                onclick: onSort,
            }),
    },
    {
        header: m['common.datatable.actions'](),
        enableHiding: false,
        cell: ({ row }) =>
            renderComponent(DatatableSearchCompanyAdministratorAction, {
                user: row.original,
                addAdministrator,
                removeAdministrator,
            }),
    },
];
