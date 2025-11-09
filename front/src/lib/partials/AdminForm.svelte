<script lang="ts">
    import { enhance } from '$app/forms';
    import { Button } from '#lib/components/ui/button';
    import { m } from '#lib/paraglide/messages';
    import { page } from '$app/state';
    import type { PageDataError } from '../../app';
    import { showToast } from '#lib/services/toastService';
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
    } from '#lib/components/ui/alert-dialog';
    import { wrappedFetch } from '#lib/services/requestService';
    import { location, navigate } from '#lib/stores/locationStore';
    import type { Snippet } from 'svelte';
    import { Spinner } from '#lib/components/ui/spinner';

    type Props = {
        children: Snippet;
        id?: string;
        canSubmit: boolean;
        deleteTitle?: string;
        deleteText?: string;
        action?: string;
        onError?: () => void;
    };

    let { children, id, canSubmit, deleteTitle, deleteText, action, onError }: Props = $props();

    let isLoading: boolean = $state(false);
    let showDialog: boolean = $state(false);

    const handleDelete = async (): Promise<void> => {
        showDialog = false;
        await wrappedFetch(`${$location.replace(`/edit/${id}`, '')}/delete`, { method: 'POST', body: { data: [id] } }, (data) => {
            const isSuccess: boolean = data.messages.map((status: { isSuccess: boolean; message: string; id: string }) => {
                console.log(status);
                showToast(status.message, status.isSuccess ? 'success' : 'error');
                return status.isSuccess;
            })[0];

            if (isSuccess) {
                navigate(`${$location.replace(`/edit/${id}`, '')}`);
            }
        });
    };

    $effect((): void => {
        isLoading = false;

        if (!page.data.formError) {
            return;
        }
        page.data.formError?.errors.forEach((error: PageDataError) => {
            showToast(error.message, error.type);
        });
        page.data.formError = undefined;
        onError?.();
    });
</script>

<form
    use:enhance
    method="POST"
    {action}
    enctype="multipart/form-data"
    class="py-10 px-5 flex flex-col gap-8 rounded-lg shadow-md mt-5 bg-gray-300 dark:bg-gray-700"
    onsubmit={() => (isLoading = true)}
>
    {@render children?.()}
    <div class="w-full flex justify-end gap-5 pr-5">
        {#if id}
            <Button size="lg" variant="destructive" onclick={() => (showDialog = true)}>
                {m['common.delete']()}
            </Button>
        {/if}
        <Button class="w-32" size="lg" type="submit" variant="secondary" disabled={!canSubmit}>
            {#if isLoading}
                <Spinner class="size-6" />
            {:else}
                {m[`common.${id ? 'update' : 'create'}`]()}
            {/if}
        </Button>
    </div>
</form>

<AlertDialog bind:open={showDialog}>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{deleteText}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>{m['common.cancel']()}</AlertDialogCancel>
            <AlertDialogAction onclick={handleDelete}>{m['common.continue']()}</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
