<script lang="ts">
    import { PackagePlus } from '@lucide/svelte';
    import { type SerializedEquipmentType } from 'backend/types';
    import { m } from '#lib/paraglide/messages';
    import { Button } from '#lib/components/ui/button';

    type Props = {
        equipmentType: SerializedEquipmentType;
        addCompanyEquipmentType: (equipmentTypeId: string) => void;
    };

    let { equipmentType, addCompanyEquipmentType }: Props = $props();
</script>

<Button variant="outline" onclick={() => addCompanyEquipmentType(equipmentType.id)}>
    <PackagePlus />
    {m['common.add']()}
</Button>
