<script lang="ts">
    import { Popover, PopoverContent, PopoverTrigger } from '#lib/components/ui/popover';
    import { Button } from '#lib/components/ui/button';
    import { Command, CommandList, CommandItem, CommandGroup } from '#lib/components/ui/command';
    import { X } from '@lucide/svelte';
    import { mode } from 'mode-watcher';
    import { m } from '#lib/paraglide/messages';

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
        category.items = category.items.filter((listItem: SelectItem) => listItem.value !== item.value);
        categories = [...categories];

        if (categories.every((c) => !c.items.length)) {
            isOpen = false;
        }
    };

    const removeItem = (item: SelectItem): void => {
        selectedItems = selectedItems.filter((selectedItem) => selectedItem.value !== item.value);

        categories = categories.map((category: SelectCategory) => {
            if (category.label === item.category) {
                return {
                    ...category,
                    items: [...category.items, item].sort((a, b) => a.label.localeCompare(b.label)),
                };
            }
            return category;
        });
    };
</script>

<div class="flex flex-col gap-2 my-3">
    <Popover bind:open={isOpen}>
        <div class="flex gap-5">
            <PopoverTrigger disabled={categories.every((category: SelectCategory) => !category.items.length)}>
                <Button disabled={categories.every((category: SelectCategory) => !category.items.length)}>
                    {m['common.multiselect.selected']({ count: selectedItems.length })}
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

        <PopoverContent class="w-72">
            <Command>
                <CommandList>
                    {#each categories as category}
                        {#if category.items.length}
                            <CommandGroup>
                                <div class="flex items-center gap-2 mb-1">
                                    {#if category.thumbnailPath}
                                        <img
                                            src={category.thumbnailPath}
                                            alt={category.label}
                                            class="size-6 rounded {mode.current === 'dark' ? 'filter invert sepia-100 saturate-500 hue-rotate-180' : ''}"
                                        />
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
