<script lang="ts" module>
    export type SelectItem = {
        value: string;
        label: string;
    };
</script>

<script lang="ts">
    import { Popover, PopoverContent, PopoverTrigger } from '#lib/components/ui/popover';
    import { Button } from '#lib/components/ui/button';
    import { Command, CommandList, CommandItem } from '#lib/components/ui/command';
    import { X } from '@lucide/svelte';

    type Props = {
        items: SelectItem[];
        selectedItems: SelectItem[];
    };

    let { items, selectedItems }: Props = $props();

    let isOpen: boolean = $state(false);

    const selectItem = (item: SelectItem): void => {
        selectedItems = [...selectedItems, item];
        items = items.filter((listItem: SelectItem) => listItem.value !== item.value);
        if (!items.length) {
            isOpen = false;
        }
    };

    const removeItem = (item: SelectItem): void => {
        selectedItems = selectedItems.filter((selectedItem: SelectItem) => selectedItem.value !== item.value);
        items = [...items, item];
    };
</script>

<div class="flex flex-col gap-2 my-3">
    <Popover bind:open={isOpen}>
        <div class="flex gap-5">
            <PopoverTrigger disabled={!items.length}>
                <Button disabled={!items.length}>{selectedItems.length > 0 ? `${selectedItems.length} sélectionné(s)` : 'Sélectionner'}</Button>
            </PopoverTrigger>

            <div class="flex flex-wrap gap-2">
                {#each selectedItems as item}
                    <Button size="sm" variant="secondary" onclick={() => removeItem(item)}>
                        {item.label}
                        <X class="size-4 ml-1" />
                    </Button>
                {/each}
            </div>
        </div>

        <PopoverContent class="w-60">
            <Command>
                <CommandList>
                    {#each items as item}
                        <CommandItem onclick={() => selectItem(item)}>
                            {item.label}
                        </CommandItem>
                    {/each}
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</div>
