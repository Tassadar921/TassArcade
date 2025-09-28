<script lang="ts">
    import { Popover, PopoverContent, PopoverTrigger } from '#lib/components/ui/popover';
    import { Button } from '#lib/components/ui/button';
    import { Command, CommandList, CommandItem, CommandGroup } from '#lib/components/ui/command';
    import { X } from '@lucide/svelte';

    export type SelectItem = {
        value: string;
        label: string;
        category: string;
    };

    export type SelectCategory = {
        label: string;
        items: SelectItem[];
        thumbnailPath?: string;
    };

    type Props = {
        categories: SelectCategory[];
        selectedItems: SelectItem[];
    };

    let { categories = $bindable([]), selectedItems = $bindable([]) }: Props = $props();

    let isOpen: boolean = $state(false);

    const selectItem = (item: SelectItem, category: SelectCategory): void => {
        selectedItems = [...selectedItems, item];
        category.items = category.items.filter((listItem) => listItem.value !== item.value);
        categories = [...categories];

        if (categories.every((c) => !c.items.length)) {
            isOpen = false;
        }
    };

    const removeItem = (item: SelectItem): void => {
        selectedItems = selectedItems.filter((selectedItem) => selectedItem.value !== item.value);

        const category: SelectCategory | undefined = categories.find((c) => c.label === item.category);
        if (category) {
            category.items = [...category.items, item];
            categories = [...categories];
        }
    };
</script>

<div class="flex flex-col gap-2 my-3">
    <Popover bind:open={isOpen}>
        <div class="flex gap-5">
            <PopoverTrigger disabled={categories.every((c) => !c.items.length)}>
                <Button disabled={categories.every((c) => !c.items.length)}>
                    {selectedItems.length > 0 ? `${selectedItems.length} sélectionné(s)` : 'Sélectionner'}
                </Button>
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
                    {#each categories as category}
                        {#if category.items.length}
                            <CommandGroup>
                                <div class="flex items-center gap-2 mb-1">
                                    {#if category.thumbnailPath}
                                        <img src={category.thumbnailPath} alt={category.label} class="size-6 rounded" />
                                    {/if}
                                    <p class="font-bold">{category.label}</p>
                                </div>

                                {#each category.items as item}
                                    <CommandItem onclick={() => selectItem(item, category)} class="cursor-pointer">
                                        {item.label}
                                    </CommandItem>
                                {/each}
                            </CommandGroup>
                        {/if}
                    {/each}
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</div>
