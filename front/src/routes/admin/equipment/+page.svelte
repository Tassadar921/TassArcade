<script lang="ts">
    import { Title } from '#lib/components/ui/title';
    import { m } from '#lib/paraglide/messages';
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import type { PaginatedEquipments } from 'backend/types';
    import { wrappedFetch } from '#lib/services/requestService';
    import { DataTable } from '#lib/components/ui/data-table';
    import { getEquipmentsColumns } from './columns';
    import { Breadcrumb } from '#lib/components/ui/breadcrumb';

    let paginatedEquipments: PaginatedEquipments | undefined = $state();
    let selectedEquipments: { id: string; label: string }[] = $state([]);
    let query: string = $state('');
    let sortBy: string = $state('equipment_translations.name:asc');

    onMount(async (): Promise<void> => {
        if (page.data.isSuccess) {
            paginatedEquipments = page.data.equipments;
        } else {
            await getEquipments();
        }
    });

    const handleSort = (field: string, order: 'asc' | 'desc'): void => {
        sortBy = `${field}:${order}`;
        getEquipments();
    };

    const handleDelete = async (): Promise<void> => {
        if (!paginatedEquipments) {
            return;
        }

        await getEquipments(paginatedEquipments.currentPage, paginatedEquipments.limit);
    };

    const getEquipments = async (page: number = 1, limit: number = 10): Promise<void> => {
        await wrappedFetch(`/admin/equipment?page=${page}&limit=${limit}&query=${query}&sortBy=${sortBy}`, { method: 'GET' }, ({ equipments }): void => {
            paginatedEquipments = equipments;
        });
    };
</script>

<Title title={m['admin.equipment.title']()} hasBackground />

<Breadcrumb items={[{ title: m['admin.title'](), href: '/admin' }, { title: m['admin.equipment.title']() }]} />

{#if paginatedEquipments}
    <div class="mt-3">
        <DataTable
            paginatedObject={paginatedEquipments}
            data={paginatedEquipments.equipments}
            columns={getEquipmentsColumns(handleSort, handleDelete)}
            onSearch={getEquipments}
            bind:query
            bind:selectedRows={selectedEquipments}
            onBatchDelete={handleDelete}
            batchDeleteTitle={m['admin.equipment.delete.title']({ equipments: selectedEquipments.map((equipment) => equipment.label).join(', ') })}
            batchDeleteText={m['admin.equipment.delete.text']({ equipments: selectedEquipments.map((equipment) => equipment.label).join(', '), count: selectedEquipments.length })}
            onPaginationChange={getEquipments}
            batchDeleteKey="name"
        />
    </div>
{/if}
