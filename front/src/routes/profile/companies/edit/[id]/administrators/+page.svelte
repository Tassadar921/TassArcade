<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import type { PaginatedCompanyAdministrators, PaginatedSearchCompanyAdministrators, SearchCompanyAdministrator, SerializedCompanyAdministrator } from 'backend/types';
    import { wrappedFetch } from '#lib/services/requestService';
    import { DataTable } from '#lib/components/ui/data-table';
    import { getCompanyAdministratorsColumns, getSearchCompanyAdministratorsColumns } from './columns';
    import { m } from '#lib/paraglide/messages';
    import { Dialog, DialogContent, DialogPortal } from '#lib/components/ui/dialog';
    import AddCompanyAdministrator from '#lib/partials/profile/company/administrators/AddCompanyAdministrator.svelte';
    import { showToast } from '#lib/services/toastService';

    let paginatedCompanyAdministrators: PaginatedCompanyAdministrators | undefined = $state();
    let paginatedUsers: PaginatedSearchCompanyAdministrators | undefined = $state();
    let selectedUsers: string[] = $state([]);
    let query: string = $state('');
    let sortBy: string = $state('users.username:asc');
    let showDialog: boolean = $state(false);

    onMount(async (): Promise<void> => {
        if (page.data.isSuccess) {
            paginatedCompanyAdministrators = page.data.administrators;
            paginatedUsers = page.data.users;
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

    const removeAdministrator = async (userId: string): Promise<void> => {
        if (!paginatedCompanyAdministrators) {
            return;
        }

        await wrappedFetch(`/profile/companies/edit/${page.params.id}/administrators/remove`, { method: 'POST', body: { userId } }, ({ data }): void => {
            showToast(data.message, data.isSuccess, 'success');
            paginatedCompanyAdministrators!.administrators = paginatedCompanyAdministrators!.administrators.filter(
                (administrator: SerializedCompanyAdministrator, i: number): boolean => administrator.user.id !== userId
            );
        });
    };
</script>

{#if paginatedCompanyAdministrators}
    <div class="mt-3">
        <DataTable
            paginatedObject={paginatedCompanyAdministrators}
            data={paginatedCompanyAdministrators.administrators}
            columns={getCompanyAdministratorsColumns(handleSort, removeAdministrator)}
            onSearch={getAdministrators}
            bind:query
            bind:selectedRows={selectedUsers}
            onPaginationChange={async (page: number, limit: number) => await getAdministrators(page, limit)}
            editable={false}
            createText={m['common.add']()}
            onCreateClick={() => (showDialog = true)}
        />
    </div>
{/if}

<Dialog bind:open={showDialog}>
    <DialogPortal>
        <DialogContent class="min-w-[90%] md:min-w-[800px]">
            {#if paginatedCompanyAdministrators && paginatedUsers}
                <AddCompanyAdministrator
                    bind:paginatedUsers
                    parentLimit={paginatedCompanyAdministrators.limit}
                    parentPage={paginatedCompanyAdministrators.currentPage}
                    {getAdministrators}
                    searchCompanyAdministratorsColumns={getSearchCompanyAdministratorsColumns}
                />
            {/if}
        </DialogContent>
    </DialogPortal>
</Dialog>
