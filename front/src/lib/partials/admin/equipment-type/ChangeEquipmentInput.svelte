<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import type { PaginatedEquipments, SerializedEquipmentLight } from 'backend/types';
    import { Dialog, DialogContent, DialogPortal } from '#lib/components/ui/dialog';
    import { Input } from '#lib/components/ui/input';
    import { RefreshCcw } from '@lucide/svelte';
    import { Button } from '#lib/components/ui/button';
    import ChangeEquipment from '#lib/partials/admin/equipment-type/ChangeEquipment.svelte';

    type Props = {
        paginatedEquipments: PaginatedEquipments;
        equipment: SerializedEquipmentLight;
    };

    let { paginatedEquipments = $bindable(), equipment }: Props = $props();

    let showDialog: boolean = $state(false);

    const handleChangeEquipment = async (newEquipment: SerializedEquipmentLight): Promise<void> => {
        equipment = newEquipment;
        showDialog = false;
    };
</script>

<div class="flex gap-3">
    <input type="hidden" name="equipment-id" value={equipment.id} />
    <Input type="text" name="equipment-type" label={m['company.edit.equipments.fields.category']()} value={equipment.name} disabled />
    <Button variant="outline" onclick={() => (showDialog = true)}>
        <RefreshCcw />
    </Button>
</div>

<Dialog bind:open={showDialog}>
    <DialogPortal>
        <DialogContent class="min-w-[90%] md:min-w-200">
            <ChangeEquipment bind:paginatedEquipments {handleChangeEquipment} />
        </DialogContent>
    </DialogPortal>
</Dialog>
