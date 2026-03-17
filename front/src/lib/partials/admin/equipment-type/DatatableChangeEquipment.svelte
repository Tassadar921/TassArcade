<script lang="ts">
    import { PackagePlus } from '@lucide/svelte';
    import { type SerializedEquipment } from 'backend/types';
    import { m } from '#lib/paraglide/messages';
    import { Button } from '#lib/components/ui/button';

    type Props = {
        equipment: SerializedEquipment;
        changeEquipment: (equipment: SerializedEquipment) => void;
    };

    let { equipment, changeEquipment }: Props = $props();
</script>

<Button variant="outline" onclick={() => changeEquipment(equipment)}>
    <PackagePlus />
    {m['common.add']()}
</Button>
