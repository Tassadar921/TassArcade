import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import type { SerializedCompany } from 'backend/types';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { SortableColumn, DataTableActions } from '#lib/components/ui/data-table';

export const getCompanyColumns = (onSort: (field: string, order: 'asc' | 'desc') => void): ColumnDef<SerializedCompany>[] => [
    {
        id: 'name',
        accessorKey: 'name',
        header: () =>
            renderComponent(SortableColumn, {
                title: m['company.fields.name.label'](),
                field: 'name',
                onclick: onSort,
            }),
        enableHiding: false,
    },
    {
        id: 'siret',
        accessorKey: 'siret',
        meta: {
            headerName: m['company.fields.siret.label'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['company.fields.siret.label'](),
                field: 'siret',
                onclick: onSort,
            }),
    },
    {
        id: 'email',
        accessorKey: 'email',
        meta: {
            headerName: m['company.fields.email.label'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['company.fields.email.label'](),
                field: 'email',
                onclick: onSort,
            }),
    },
    {
        id: 'phoneNumber',
        accessorKey: 'phoneNumber',
        meta: {
            headerName: m['common.phone-number.label'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['common.phone-number.label'](),
                field: 'phoneNumber',
                onclick: onSort,
            }),
    },
    {
        id: 'enabled',
        accessorKey: 'enabled',
        meta: {
            headerName: m['company.fields.enabled'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['company.fields.enabled'](),
                field: 'enabled',
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
