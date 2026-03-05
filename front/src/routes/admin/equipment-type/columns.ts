import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import type { SerializedEquipmentTypeExtended } from 'backend/types';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { Checkbox } from '#lib/components/ui/checkbox';
import { SortableColumn, DataTableActions } from '#lib/components/ui/data-table';
import DatatableThumbnail from '#lib/partials/admin/shared/DatatableThumbnail.svelte';

export const getEquipmentTypesColumns = (onSort: (field: string, order: 'asc' | 'desc') => void, onDelete: (ids: string[]) => void): ColumnDef<SerializedEquipmentTypeExtended>[] => [
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
                field: 'equipment_type_translations.name',
                onclick: onSort,
            }),
        enableHiding: false,
    },
    {
        header: m['admin.equipment.fields.thumbnail.title'](),
        meta: {
            headerName: m['admin.equipment.fields.thumbnail.title'](),
        },
        cell: ({ row }) =>
            renderComponent(DatatableThumbnail, {
                equipment: row.original.equipment,
            }),
    },
    {
        header: m['common.datatable.actions'](),
        enableHiding: false,
        cell: ({ row }) =>
            renderComponent(DataTableActions, {
                id: row.original.id,
                onDelete,
                deleteTitle: m['admin.equipment.delete.title']({ equipments: row.original.name }),
                deleteText: m['admin.equipment.delete.text']({ equipments: row.original.name, count: 1 }),
            }),
    },
];
