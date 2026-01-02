<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import type { PaginatedCompanyEquipmentTypes, PaginatedEquipments, SerializedCompanyEquipmentType } from 'backend/types';
    import { wrappedFetch } from '#lib/services/requestService';
    import { DataTable } from '#lib/components/ui/data-table';
    import { m } from '#lib/paraglide/messages';
    import { showToast } from '#lib/services/toastService';
    import { getCompanyEquipmentsColumns } from './columns';

    let paginatedCompanyEquipments: PaginatedCompanyEquipmentTypes | undefined = $state();
    let paginatedEquipments: PaginatedEquipments | undefined = $state();
    let selectedUsers: string[] = $state([]);
    let query: string = $state('');
    let sortBy: string = $state('users.username:asc');
    let showDialog: boolean = $state(false);

    onMount(async (): Promise<void> => {
        if (page.data.isSuccess) {
            paginatedCompanyEquipments = page.data.companyEquipments;
            paginatedEquipments = page.data.equipments;
        } else {
            await getEquipments();
        }
    });

    const handleSort = (field: string, order: 'asc' | 'desc'): void => {
        sortBy = `${field}:${order}`;
        getEquipments();
    };

    const getEquipments = async (currentPage: number = 1, limit: number = 10): Promise<void> => {
        await wrappedFetch(`/profile/companies/edit/${page.params.id}/equipments?page=${currentPage}&limit=${limit}&query=${query}&sortBy=${sortBy}`, { method: 'GET' }, ({ data }): void => {
            paginatedCompanyEquipments = data;
        });
    };

    const removeEquipment = async (equipmentId: string): Promise<void> => {
        if (!paginatedCompanyEquipments) {
            return;
        }

        await wrappedFetch(`/profile/companies/edit/${page.params.id}/equipments/remove`, { method: 'POST', body: { equipmentId } }, ({ data }): void => {
            showToast(data.message, data.isSuccess, 'success');
            paginatedCompanyEquipments!.equipmentTypes = paginatedCompanyEquipments!.equipmentTypes.filter((equipment: SerializedCompanyEquipmentType): boolean => equipment.id !== equipmentId);
        });
    };
</script>

{#if paginatedCompanyEquipments}
    <div class="mt-3">
        <DataTable
            paginatedObject={paginatedCompanyEquipments}
            data={paginatedCompanyEquipments.equipmentTypes}
            columns={getCompanyEquipmentsColumns(handleSort, removeEquipment)}
            onSearch={getEquipments}
            bind:query
            bind:selectedRows={selectedUsers}
            onPaginationChange={getEquipments}
            editable={false}
            createText={m['common.add']()}
            onCreateClick={() => (showDialog = true)}
            selectable={false}
        />
    </div>
{/if}
