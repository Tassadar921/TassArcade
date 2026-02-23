import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { SortableColumn } from '#lib/components/ui/data-table';
import type { SerializedEquipmentType } from 'backend/types';
import DatatableAddCompanyEquipmentType from '#lib/partials/profile/company/equipments/DatatableAddCompanyEquipmentType.svelte';
import DatatableChangeCompanyEquipmentType from '#lib/partials/profile/company/equipments/DatatableChangeCompanyEquipmentType.svelte';

export const getEquipmentsColumns = (onSort: (field: string, order: 'asc' | 'desc') => void, onChange: (equipmentType: SerializedEquipmentType) => void): ColumnDef<SerializedEquipmentType>[] => [
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
            renderComponent(DatatableChangeCompanyEquipmentType, {
                companyEquipmentType: row.original,
                changeCompanyEquipmentType: onChange,
            }),
    },
];
