<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import type { PaginatedCompanyAdministrators } from 'backend/types';
    import { wrappedFetch } from '#lib/services/requestService';
    import { DataTable } from '#lib/components/ui/data-table';
    import { getUserColumns } from './columns';

    let paginatedCompanyAdministrators: PaginatedCompanyAdministrators | undefined = $state();
    let selectedUsers: string[] = $state([]);
    let query: string = $state('');
    let sortBy: string = $state('username:asc');

    onMount(async (): Promise<void> => {
        if (page.data.isSuccess) {
            paginatedCompanyAdministrators = page.data.administrators;
        } else {
            await getAdministrators();
        }
    });

    const handleSort = (field: string, order: 'asc' | 'desc'): void => {
        sortBy = `${field}:${order}`;
        getAdministrators();
    };

    const getAdministrators = async (currentPage: number = 1, limit: number = 10): Promise<void> => {
        await wrappedFetch(`/profile/companies/edit/${page.params.id}/administrators?page=${currentPage}&limit=${limit}&query=${query}&sortBy=${sortBy}`, { method: 'GET' }, ({ data }): void => {
            paginatedCompanyAdministrators = data;
        });
    };
</script>

{#if paginatedCompanyAdministrators}
    <div class="mt-3">
        <DataTable
            paginatedObject={paginatedCompanyAdministrators}
            data={paginatedCompanyAdministrators.administrators}
            columns={getUserColumns(handleSort)}
            onSearch={getAdministrators}
            bind:query
            bind:selectedRows={selectedUsers}
            onPaginationChange={async (page: number, limit: number) => await getAdministrators(page, limit)}
        />
    </div>
{/if}
