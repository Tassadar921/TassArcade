<script lang="ts">
    import AddressExternalLink from '#components/AddressExternalLink.svelte';
    import { DialogDescription, DialogHeader, DialogTitle } from '#lib/components/ui/dialog';
    import type { SerializedCompanyEquipmentType, SerializedCompanyLight } from 'backend/types';

    type Props = {
        selectedCompany: SerializedCompanyLight | null;
        selectedCompanyEquipment: SerializedCompanyEquipmentType | null;
    };

    let { selectedCompany, selectedCompanyEquipment }: Props = $props();
</script>

{#if selectedCompany && selectedCompanyEquipment}
    <DialogHeader>
        <DialogTitle>{selectedCompany.name} - {selectedCompanyEquipment.name}</DialogTitle>
        <DialogDescription>
            <AddressExternalLink latitude={selectedCompany.address.latitude} longitude={selectedCompany.address.longitude} address={selectedCompany.address.fullAddress} />
            <p>{selectedCompanyEquipment.description}</p>
        </DialogDescription>
    </DialogHeader>
{/if}
