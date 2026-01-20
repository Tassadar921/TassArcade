<script lang="ts">
    import { PackagePlus } from '@lucide/svelte';
    import { type SerializedEquipmentType } from 'backend/types';
    import { m } from '#lib/paraglide/messages';
    import { Button } from '#lib/components/ui/button';

    type Props = {
        companyEquipmentType: SerializedEquipmentType;
        addCompanyEquipmentType: (EquipmentTypeId: string) => void;
    };

    let { companyEquipmentType, addCompanyEquipmentType }: Props = $props();
</script>

<Button variant="outline" onclick={() => addCompanyEquipmentType(companyEquipmentType.id)}>
    <PackagePlus />
    {m['common.add']()}
</Button>
