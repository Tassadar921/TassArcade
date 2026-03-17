<script lang="ts">
    import { Title } from '#lib/components/ui/title';
    import { m } from '#lib/paraglide/messages';
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import type { PaginatedEquipmentTypes } from 'backend/types';
    import { wrappedFetch } from '#lib/services/requestService';
    import { DataTable } from '#lib/components/ui/data-table';
    import { getEquipmentTypesColumns } from './columns';
    import { Breadcrumb } from '#lib/components/ui/breadcrumb';

    let paginatedEquipmentTypes: PaginatedEquipmentTypes | undefined = $state();
    let selectedEquipmentTypes: { id: string; label: string }[] = $state([]);
    let query: string = $state('');
    let sortBy: string = $state('equipment_type_translations.name:asc');

    onMount(async (): Promise<void> => {
        if (page.data.isSuccess) {
            paginatedEquipmentTypes = page.data.equipmentTypes;
        } else {
            await getEquipmentTypes();
        }
    });

    const handleSort = (field: string, order: 'asc' | 'desc'): void => {
        sortBy = `${field}:${order}`;
        getEquipmentTypes();
    };

    const handleDelete = async (): Promise<void> => {
        if (!paginatedEquipmentTypes) {
            return;
        }

        await getEquipmentTypes(paginatedEquipmentTypes.currentPage, paginatedEquipmentTypes.limit);
    };

    const getEquipmentTypes = async (page: number = 1, limit: number = 10): Promise<void> => {
        await wrappedFetch(`/admin/equipment-type?page=${page}&limit=${limit}&query=${query}&sortBy=${sortBy}`, { method: 'GET' }, ({ equipments }): void => {
            paginatedEquipmentTypes = equipments;
        });
    };
</script>

<Title title={m['admin.equipment-type.title']()} hasBackground />

<Breadcrumb items={[{ title: m['admin.title'](), href: '/admin' }, { title: m['admin.equipment-type.title']() }]} />

{#if paginatedEquipmentTypes}
    <div class="mt-3">
        <DataTable
            paginatedObject={paginatedEquipmentTypes}
            data={paginatedEquipmentTypes.equipments}
            columns={getEquipmentTypesColumns(handleSort, handleDelete)}
            onSearch={getEquipmentTypes}
            bind:query
            bind:selectedRows={selectedEquipmentTypes}
            onBatchDelete={handleDelete}
            batchDeleteTitle={m['admin.equipment-type.delete.title']({ equipmentTypes: selectedEquipmentTypes.map((equipment) => equipment.label).join(', ') })}
            batchDeleteText={m['admin.equipment-type.delete.text']({ equipmentTypes: selectedEquipmentTypes.map((equipment) => equipment.label).join(', '), count: selectedEquipmentTypes.length })}
            onPaginationChange={getEquipmentTypes}
            batchDeleteKey="name"
        />
    </div>
{/if}
