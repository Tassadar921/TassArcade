<script lang="ts">
    import { PackagePlus } from '@lucide/svelte';
    import { type SerializedEquipmentType } from 'backend/types';
    import { m } from '#lib/paraglide/messages';
    import { Button } from '#lib/components/ui/button';

    type Props = {
        companyEquipmentType: SerializedEquipmentType;
        changeCompanyEquipmentType: (EquipmentTypeId: string) => void;
    };

    let { companyEquipmentType, changeCompanyEquipmentType }: Props = $props();
</script>

<Button variant="outline" onclick={() => changeCompanyEquipmentType(companyEquipmentType.id)}>
    <PackagePlus />
    {m['common.choose']()}
</Button>
