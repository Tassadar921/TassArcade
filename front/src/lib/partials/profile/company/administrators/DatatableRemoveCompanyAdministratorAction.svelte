<script lang="ts">
    import { UserRoundMinus } from '@lucide/svelte';
    import type { SerializedCompanyAdministrator } from 'backend/types';
    import { m } from '#lib/paraglide/messages';
    import { Button } from '#lib/components/ui/button';

    type Props = {
        administrator: SerializedCompanyAdministrator;
        removeAdministrator: (userId: string) => void;
    };

    let { administrator, removeAdministrator }: Props = $props();
</script>

<Button variant="outline" onclick={() => removeAdministrator(administrator.user.id)}>
    <UserRoundMinus />
    {m['common.remove']()}
</Button>
