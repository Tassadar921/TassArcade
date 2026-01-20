import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { SortableColumn } from '#lib/components/ui/data-table';
import type { SerializedCompanyEquipmentType, SerializedEquipmentType } from 'backend/types';
import DatatableAddCompanyEquipmentType from '#lib/partials/profile/company/equipments/DatatableAddCompanyEquipmentType.svelte';

export const getCompanyEquipmentsColumns = (onSort: (field: string, order: 'asc' | 'desc') => void, removeEquipment: (equipmentId: string) => void): ColumnDef<SerializedCompanyEquipmentType>[] => [
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
        accessorKey: 'category.category',
        meta: {
            headerName: m['common.yes'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['common.yes'](),
                field: 'equipment.category',
                onclick: onSort,
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
            headerName: m['company.edit.equipments.add.fields.category'](),
        },
        header: () =>
            renderComponent(SortableColumn, {
                title: m['company.edit.equipments.add.fields.category'](),
                field: 'equipments.category',
                onclick: onSort,
            }),
    },
    {
        header: m['common.datatable.actions'](),
        enableHiding: false,
        cell: ({ row }) =>
            renderComponent(DatatableAddCompanyEquipmentType, {
                companyEquipmentType: row.original,
                addCompanyEquipmentType: onAdd,
            }),
    },
];
