<script lang="ts">
    import { PackagePlus } from '@lucide/svelte';
    import { type SerializedEquipmentType } from 'backend/types';
    import { m } from '#lib/paraglide/messages';
    import { Button } from '#lib/components/ui/button';

    type Props = {
        companyEquipmentType: SerializedEquipmentType;
        changeCompanyEquipmentType: (equipmentType: SerializedEquipmentType) => void;
    };

    let { companyEquipmentType, changeCompanyEquipmentType }: Props = $props();
</script>

<Button variant="outline" onclick={() => changeCompanyEquipmentType(companyEquipmentType)}>
    <PackagePlus />
    {m['common.choose']()}
</Button>
