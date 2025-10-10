<script lang="ts">
    import { mode } from 'mode-watcher';
    import AddressExternalLink from '#components/AddressExternalLink.svelte';
    import { Button } from '#lib/components/ui/button';
    import { DialogDescription, DialogHeader, DialogTitle } from '#lib/components/ui/dialog';
    import type { SerializedCompany, SerializedCompanyEquipmentType, SerializedEquipmentLight } from 'backend/types';

    type Props = {
        selectedCompany: SerializedCompany | null;
        reorganizedEquipments: Record<string, { category: SerializedEquipmentLight; items: SerializedCompanyEquipmentType[] }> | undefined;
    };

    let { selectedCompany, reorganizedEquipments }: Props = $props();
</script>

{#if selectedCompany}
    <DialogHeader>
        <DialogTitle>{selectedCompany.name}</DialogTitle>
        <DialogDescription>
            <AddressExternalLink latitude={selectedCompany.address.latitude} longitude={selectedCompany.address.longitude} address={selectedCompany.address.fullAddress} />
        </DialogDescription>
    </DialogHeader>
    {#if reorganizedEquipments}
        <div class="md:grid gap-4" style="grid-template-columns: repeat({Object.values(reorganizedEquipments).length}, minmax(0, 1fr));">
            {#each Object.values(reorganizedEquipments) as { category, items }}
                <div class="mb-4 flex flex-col gap-4">
                    <h3 class="font-semibold text-lg flex items-center gap-2">
                        <img
                            src={`/assets/equipment-thumbnail/${category.id}`}
                            alt={category.name}
                            class="size-6 rounded {mode.current === 'dark' ? 'filter invert sepia-100 saturate-500 hue-rotate-180' : ''}"
                        />
                        {category.name}
                    </h3>
                    <ul class="flex flex-wrap gap-2">
                        {#each items as equipment}
                            <li>
                                <Button variant="outline" class="flex flex-col items-center gap-1 w-56 h-20">
                                    <p>{equipment.name}</p>
                                    <p class="text-gray-700 dark:text-gray-500 text-sm text-wrap">{equipment.description}</p>
                                </Button>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/each}
        </div>
    {/if}
{/if}
