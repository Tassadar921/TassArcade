import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { SortableColumn } from '#lib/components/ui/data-table';
import type { SearchCompanyAdministrator, SerializedCompanyEquipmentType } from 'backend/types';

export const getCompanyEquipmentsColumns = (onSort: (field: string, order: 'asc' | 'desc') => void, removeEquipment: (equipmentId: string) => void): ColumnDef<SerializedCompanyEquipmentType>[] => [
    {
        id: 'name',
        accessorKey: 'name',
        enableHiding: false,
    },
    {
        id: 'category',
        accessorKey: 'category.name',
    },
];

export const getEquipmentsColumns = (onSort: (field: string, order: 'asc' | 'desc') => void): ColumnDef<SerializedEquipm>[] => [
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
];
