<script lang="ts">
    import { UserRoundPlus, UserRoundMinus } from '@lucide/svelte';
    import type { SearchCompanyAdministrator } from 'backend/types';
    import { m } from '#lib/paraglide/messages';
    import { Button } from '#lib/components/ui/button';

    type Props = {
        user: SearchCompanyAdministrator;
        addAdministrator: (userId: string) => void;
        removeAdministrator: (userId: string) => void;
    };

    let { user, addAdministrator, removeAdministrator }: Props = $props();
</script>

{#if user.isAdministrator}
    <Button variant="outline" onclick={() => removeAdministrator(user.user.id)}>
        <UserRoundMinus />
        {m['common.remove']()}
    </Button>
{:else}
    <Button variant="outline" onclick={() => addAdministrator(user.user.id)}>
        <UserRoundPlus />
        {m['common.add']()}
    </Button>
{/if}
