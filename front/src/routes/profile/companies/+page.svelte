<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import type { PaginatedCompanies, SerializedCompany } from 'backend/types';
    import { wrappedFetch } from '#lib/services/requestService';
    import { DataTable } from '#lib/components/ui/data-table';
    import { getCompanyColumns } from './columns';

    let paginatedCompanies: PaginatedCompanies | undefined = $state();
    let query: string = $state('');
    let sortBy: string = $state('name:asc');

    onMount(async (): Promise<void> => {
        if (page.data.isSuccess) {
            paginatedCompanies = page.data.data;
        } else {
            await getCompanies();
        }
    });

    const handleSort = (field: string, order: 'asc' | 'desc'): void => {
        sortBy = `${field}:${order}`;
        getCompanies();
    };

    const getCompanies = async (page: number = 1, limit: number = 10): Promise<void> => {
        await wrappedFetch(`/profile/companies?page=${page}&limit=${limit}&query=${query}&sortBy=${sortBy}`, { method: 'GET' }, ({ data }): void => {
            paginatedCompanies = data;
        });
    };
</script>

{#if paginatedCompanies}
    <div class="mt-3">
        <DataTable
            paginatedObject={paginatedCompanies}
            data={paginatedCompanies.companies}
            columns={getCompanyColumns(handleSort)}
            onSearch={getCompanies}
            bind:query
            selectable={false}
            onPaginationChange={async (page: number, limit: number) => await getCompanies(page, limit)}
        />
    </div>
{/if}
