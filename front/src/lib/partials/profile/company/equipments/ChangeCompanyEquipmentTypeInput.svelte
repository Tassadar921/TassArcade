<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import type { PaginatedEquipments, SerializedEquipmentType } from 'backend/types';
    import { Dialog, DialogContent, DialogPortal } from '#lib/components/ui/dialog';
    import ChangeCompanyEquipmentType from '#lib/partials/profile/company/equipments/ChangeCompanyEquipmentType.svelte';
    import { Input } from '#lib/components/ui/input';
    import { RefreshCcw } from '@lucide/svelte';
    import { Button } from '#lib/components/ui/button';

    type Props = {
        paginatedEquipments: PaginatedEquipments;
        equipmentType: SerializedEquipmentType;
    };

    let { paginatedEquipments = $bindable(), equipmentType }: Props = $props();

    let showDialog: boolean = $state(false);
</script>

<div class="flex gap-3">
    <Input type="text" name="equipment-type" label={m['company.edit.equipments.fields.category']()} value={equipmentType.name} readonly />
    <Button variant="outline" onclick={() => (showDialog = true)}>
        <RefreshCcw />
    </Button>
</div>

<Dialog bind:open={showDialog}>
    <DialogPortal>
        <DialogContent class="min-w-[90%] md:min-w-200">
            <ChangeCompanyEquipmentType bind:paginatedEquipments parentLimit={paginatedEquipments.limit} parentPage={paginatedEquipments.currentPage} />
        </DialogContent>
    </DialogPortal>
</Dialog>
