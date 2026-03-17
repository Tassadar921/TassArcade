<script lang="ts">
    import type { PaginatedEquipments, SerializedEquipmentType } from 'backend/types';
    import { DataTable } from '#lib/components/ui/data-table';
    import { wrappedFetch } from '#lib/services/requestService';
    import { m } from '#lib/paraglide/messages';
    import { getEquipmentsColumns } from '../../../../../routes/profile/companies/edit/[id]/equipments/edit/[companyEquipmentTypeId]/columns';

    type Props = {
        paginatedEquipments: PaginatedEquipments;
        handleChangeEquipment: (equipmentType: SerializedEquipmentType) => void;
    };

    let { paginatedEquipments = $bindable(), handleChangeEquipment }: Props = $props();

    let query: string = $state('');
    let sortBy: string = $state('equipment_type_translations.name:asc');

    const handleSort = (field: string, order: 'asc' | 'desc'): void => {
        sortBy = `${field}:${order}`;
        getEquipments();
    };

    const getEquipments = async (currentPage: number = 1, limit: number = 10): Promise<void> => {
        await wrappedFetch(`/equipments?page=${currentPage}&limit=${limit}&query=${query}&sortBy=${sortBy}`, { method: 'GET' }, ({ data }): void => {
            paginatedEquipments = data;
        });
    };

    const onPaginationChange = async (page: number, limit: number) => await getEquipments(page, limit);
</script>

<h2>{m['company.edit.equipments.edit.choose-equipment']()}</h2>

{#if paginatedEquipments}
    <div class="mt-3">
        <DataTable
            paginatedObject={paginatedEquipments}
            data={paginatedEquipments.equipments}
            columns={getEquipmentsColumns(handleSort, handleChangeEquipment)}
            onSearch={getEquipments}
            selectable={false}
            bind:query
            {onPaginationChange}
            editable={false}
            creatable={false}
        />
    </div>
{/if}
