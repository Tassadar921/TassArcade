<script lang="ts">
    import type { PaginatedCompanyAdministrators, PaginatedSearchCompanyAdministrators, SearchCompanyAdministrator } from 'backend/types';
    import { DataTable } from '#lib/components/ui/data-table';
    import { wrappedFetch } from '#lib/services/requestService';
    import { page } from '$app/state';
    import { showToast } from '#lib/services/toastService';
    import { m } from '#lib/paraglide/messages';

    type Props = {
        paginatedUsers: PaginatedSearchCompanyAdministrators;
        parentLimit: number;
        parentPage: number;
        getAdministrators: (currentPage: number, limit: number) => void;
        searchCompanyAdministratorsColumns: any;
    };

    let { paginatedUsers = $bindable(), parentLimit, parentPage, getAdministrators, searchCompanyAdministratorsColumns }: Props = $props();

    let query: string = $state('');
    let sortBy: string = $state('username:asc');

    const handleSort = (field: string, order: 'asc' | 'desc'): void => {
        sortBy = `${field}:${order}`;
        getUsers();
    };

    const getUsers = async (currentPage: number = 1, limit: number = 10): Promise<void> => {
        await wrappedFetch(
            `/profile/companies/edit/${page.params.id}/administrators/search?page=${currentPage}&limit=${limit}&query=${query}&sortBy=${sortBy}`,
            { method: 'GET' },
            ({ data }): void => {
                paginatedUsers = data;
            }
        );
    };

    const addAdministrator = async (userId: string): Promise<void> => {
        const index: number = paginatedUsers.users.findIndex((searchUser: SearchCompanyAdministrator) => searchUser.user.id === userId);
        if (index < 0) {
            return;
        }

        await wrappedFetch(`/profile/companies/edit/${page.params.id}/administrators/add`, { method: 'POST', body: { userId } }, ({ data }): void => {
            showToast(data.message, 'success');
            paginatedUsers.users = paginatedUsers.users.map((user: SearchCompanyAdministrator, i: number): SearchCompanyAdministrator => (i === index ? { ...user, isAdministrator: true } : user));
            getAdministrators(parentPage, parentLimit);
        });
    };

    const removeAdministrator = async (userId: string): Promise<void> => {
        const index: number = paginatedUsers.users.findIndex((searchUser: SearchCompanyAdministrator) => searchUser.user.id === userId);
        if (index < 0) {
            return;
        }

        await wrappedFetch(`/profile/companies/edit/${page.params.id}/administrators/remove`, { method: 'POST', body: { userId } }, ({ data }): void => {
            showToast(data.message, data.isSuccess, 'success');
            paginatedUsers.users = paginatedUsers.users.map((user: SearchCompanyAdministrator, i: number): SearchCompanyAdministrator => (i === index ? { ...user, isAdministrator: false } : user));
            getAdministrators(parentPage, parentLimit);
        });
    };
</script>

<h2>{m['company.edit.administrators.add']()}</h2>

{#if paginatedUsers}
    <div class="mt-3">
        <DataTable
            paginatedObject={paginatedUsers}
            data={paginatedUsers.users}
            columns={searchCompanyAdministratorsColumns(handleSort, addAdministrator, removeAdministrator)}
            onSearch={getUsers}
            selectable={false}
            bind:query
            onPaginationChange={async (page: number, limit: number) => await getUsers(page, limit)}
            editable={false}
            creatable={false}
        />
    </div>
{/if}
