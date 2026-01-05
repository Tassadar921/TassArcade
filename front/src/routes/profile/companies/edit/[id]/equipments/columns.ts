import type { ColumnDef } from '@tanstack/table-core';
import { m } from '#lib/paraglide/messages';
import { renderComponent } from '#lib/components/ui/data-table/render-helpers';
import { SortableColumn } from '#lib/components/ui/data-table';
import type { SerializedCompanyEquipmentType, SerializedEquipment } from 'backend/types';

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

export const getEquipmentsColumns = (onSort: (field: string, order: 'asc' | 'desc') => void): ColumnDef<SerializedEquipment>[] => [
    {
        id: 'name',
        accessorKey: 'name',
        header: () =>
            renderComponent(SortableColumn, {
                title: m['common.name'](),
                field: 'equipment_types.name',
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
];
