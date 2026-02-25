import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import type { SerializedEquipment } from 'backend/types';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { Checkbox } from '#lib/components/ui/checkbox';
import { SortableColumn, DataTableActions } from '#lib/components/ui/data-table';
import DatatableThumbnail from '#lib/partials/admin/equipment/DatatableThumbnail.svelte';

export const getEquipmentsColumns = (onSort: (field: string, order: 'asc' | 'desc') => void, onDelete: (ids: string[]) => void): ColumnDef<SerializedEquipment>[] => [
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
        id: 'name',
        accessorKey: 'name',
        header: () =>
            renderComponent(SortableColumn, {
                title: m['common.name'](),
                field: 'equipment_translations.name',
                onclick: onSort,
            }),
        enableHiding: false,
    },
    {
        header: m['admin.equipments.fields.thumbnail'](),
        meta: {
            headerName: m['admin.equipments.fields.thumbnail'](),
        },
        cell: ({ row }) =>
            renderComponent(DatatableThumbnail, {
                equipment: row.original,
            }),
    },
    {
        header: m['common.datatable.actions'](),
        enableHiding: false,
        cell: ({ row }) =>
            renderComponent(DataTableActions, {
                id: row.original.id,
                onDelete,
                deleteTitle: m['admin.equipments.delete.title']({ equipments: row.original.name }),
                deleteText: m['admin.equipments.delete.text']({ equipments: row.original.name, count: 1 }),
            }),
    },
];
