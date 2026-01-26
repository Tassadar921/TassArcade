<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import type { PaginatedCompanyEquipmentTypes, PaginatedEquipments, SerializedCompanyEquipmentType } from 'backend/types';
    import { wrappedFetch } from '#lib/services/requestService';
    import { DataTable } from '#lib/components/ui/data-table';
    import { m } from '#lib/paraglide/messages';
    import { getCompanyEquipmentsColumns } from './columns';
    import { Dialog, DialogContent, DialogPortal } from '#lib/components/ui/dialog';
    import AddCompanyEquipmentType from '#lib/partials/profile/company/equipments/AddCompanyEquipmentType.svelte';

    let paginatedCompanyEquipments: PaginatedCompanyEquipmentTypes | undefined = $state();
    let paginatedEquipments: PaginatedEquipments | undefined = $state();
    let selectedUsers: string[] = $state([]);
    let query: string = $state('');
    let sortBy: string = $state('equipment_type_translations.name:asc');
    let showDialog: boolean = $state(false);

    onMount(async (): Promise<void> => {
        if (page.data.isSuccess) {
            paginatedCompanyEquipments = page.data.companyEquipments;
            paginatedEquipments = page.data.equipments;
            console.log(paginatedCompanyEquipments?.equipmentTypes[0]);
        } else {
            await getCompanyEquipments();
        }
    });

    const handleSort = (field: string, order: 'asc' | 'desc'): void => {
        sortBy = `${field}:${order}`;
        getCompanyEquipments();
    };

    const getCompanyEquipments = async (currentPage: number = 1, limit: number = 10): Promise<void> => {
        await wrappedFetch(`/profile/companies/edit/${page.params.id}/equipments?page=${currentPage}&limit=${limit}&query=${query}&sortBy=${sortBy}`, { method: 'GET' }, ({ data }): void => {
            paginatedCompanyEquipments = data;
        });
    };

    const removeEquipment = async (equipmentId: string): Promise<void> => {
        if (!paginatedCompanyEquipments) {
            return;
        }

        await wrappedFetch(`/profile/companies/edit/${page.params.id}/equipments/remove`, { method: 'POST', body: { equipmentId } }, (): void => {
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
            onSearch={getCompanyEquipments}
            bind:query
            bind:selectedRows={selectedUsers}
            onPaginationChange={getCompanyEquipments}
            editable={false}
            createText={m['common.add']()}
            onCreateClick={() => (showDialog = true)}
            selectable={false}
        />
    </div>
{/if}

<Dialog bind:open={showDialog}>
    <DialogPortal>
        <DialogContent class="min-w-[90%] md:min-w-200">
            {#if paginatedCompanyEquipments && paginatedEquipments}
                <AddCompanyEquipmentType bind:paginatedEquipments parentLimit={paginatedCompanyEquipments.limit} parentPage={paginatedCompanyEquipments.currentPage} {getCompanyEquipments} />
            {/if}
        </DialogContent>
    </DialogPortal>
</Dialog>
