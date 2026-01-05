<script lang="ts">
    import type { PaginatedEquipments } from 'backend/types';
    import { DataTable } from '#lib/components/ui/data-table';
    import { wrappedFetch } from '#lib/services/requestService';
    import { page } from '$app/state';
    import { m } from '#lib/paraglide/messages';
    import { getEquipmentsColumns } from '../../../../../routes/profile/companies/edit/[id]/equipments/columns';

    type Props = {
        paginatedEquipments: PaginatedEquipments;
    };

    let { paginatedEquipments = $bindable() }: Props = $props();

    let query: string = $state('');
    let sortBy: string = $state('name:asc');

    const handleSort = (field: string, order: 'asc' | 'desc'): void => {
        sortBy = `${field}:${order}`;
        getEquipments();
    };

    const getEquipments = async (currentPage: number = 1, limit: number = 10): Promise<void> => {
        await wrappedFetch(`/profile/companies/edit/${page.params.id}/equipments/search?page=${currentPage}&limit=${limit}&query=${query}&sortBy=${sortBy}`, { method: 'GET' }, ({ data }): void => {
            paginatedEquipments = data;
        });
    };

    const equipmentClicked = async (equipmentId: string): Promise<void> => {};

    const onPaginationChange = async (page: number, limit: number) => await getEquipments(page, limit);
</script>

<h2>{m['company.edit.equipments.add.title']()}</h2>

{#if paginatedEquipments}
    <div class="mt-3">
        <DataTable
            paginatedObject={paginatedEquipments}
            data={paginatedEquipments.equipments}
            columns={getEquipmentsColumns(handleSort)}
            onSearch={getEquipments}
            selectable={false}
            bind:query
            {onPaginationChange}
            editable={false}
            creatable={false}
        />
    </div>
{/if}
