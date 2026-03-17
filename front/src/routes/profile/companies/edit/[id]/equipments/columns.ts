import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { DataTableActions, SortableColumn } from '#lib/components/ui/data-table';
import type { SerializedCompanyEquipmentType, SerializedEquipmentType } from 'backend/types';
import DatatableAddCompanyEquipmentType from '#lib/partials/profile/company/equipments/DatatableAddCompanyEquipmentType.svelte';
import { Checkbox } from '#lib/components/ui/checkbox';

export const getCompanyEquipmentsColumns = (onSort: (field: string, order: 'asc' | 'desc') => void, onDelete: (ids: string[]) => void): ColumnDef<SerializedCompanyEquipmentType>[] => [
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
                field: 'company_equipment_types.name',
                onclick: onSort,
            }),
        enableHiding: false,
    },
    {
        id: 'category',
        accessorKey: 'category.name',
        meta: {
            headerName: m['company.edit.equipments.fields.category'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['company.edit.equipments.fields.category'](),
                field: 'equipments.category',
                onclick: onSort,
            }),
    },
    {
        id: 'type',
        accessorKey: 'type.name',
        meta: {
            headerName: m['company.edit.equipments.fields.type'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['company.edit.equipments.fields.type'](),
                field: 'equipment_type_translations.name',
                onclick: onSort,
            }),
    },
    {
        header: m['common.datatable.actions'](),
        enableHiding: false,
        cell: ({ row }) =>
            renderComponent(DataTableActions, {
                id: row.original.id,
                onDelete,
                deleteTitle: m['company.edit.equipments.delete.title']({ equipments: [row.original.name || row.original.type.name] }),
                deleteText: m['company.edit.equipments.delete.text']({ equipments: [row.original.name || row.original.type.name], count: 1 }),
            }),
    },
];

export const getEquipmentsColumns = (onSort: (field: string, order: 'asc' | 'desc') => void, onAdd: (equipmentTypeId: string) => void): ColumnDef<SerializedEquipmentType>[] => [
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
        id: 'category',
        accessorKey: 'equipment.category',
        meta: {
            headerName: m['company.edit.equipments.fields.category'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['company.edit.equipments.fields.category'](),
                field: 'equipments.category',
                onclick: onSort,
            }),
    },
    {
        header: m['common.datatable.actions'](),
        enableHiding: false,
        cell: ({ row }) =>
            renderComponent(DatatableAddCompanyEquipmentType, {
                equipmentType: row.original,
                addCompanyEquipmentType: onAdd,
            }),
    },
];
