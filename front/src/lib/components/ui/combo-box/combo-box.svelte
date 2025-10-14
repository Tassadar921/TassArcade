<script lang="ts">
    import { CheckIcon, ChevronsUpDownIcon } from '@lucide/svelte';
    import { tick } from 'svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { cn } from '$lib/utils.js';
    import { m } from '#lib/paraglide/messages';
    import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
    import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '$lib/components/ui/command';

    export type SelectItem = {
        value: string;
        label: string;
    };

    export type Props = {
        items: SelectItem[];
        placeholder?: string;
        searchPlaceholder?: string;
        noItemFound?: string;
    };

    let { items = $bindable([]), placeholder, searchPlaceholder, noItemFound }: Props = $props();

    let open: boolean = $state(false);
    let value: string = $state('');
    let triggerRef: HTMLButtonElement = $state<HTMLButtonElement>(null!);

    const selectedValue: string | undefined = $derived(items.find((item: SelectItem) => item.value === value)?.label);

    const closeAndFocusTrigger = (): void => {
        open = false;
        tick().then(() => {
            triggerRef.focus();
        });
    };
</script>

<input type="hidden" bind:value />

<Popover bind:open>
    <PopoverTrigger bind:ref={triggerRef}>
        {#snippet child({ props })}
            <Button variant="outline" class="w-[200px] justify-between" {...props} role="combobox" aria-expanded={open}>
                {selectedValue || placeholder}
                <ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
        {/snippet}
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
        <Command>
            <CommandInput placeholder={searchPlaceholder || m['common.combo-box.search-placeholder']()} />
            <CommandList>
                <CommandEmpty>{noItemFound || m['common.combo-box.no-item-found']()}</CommandEmpty>
                <CommandGroup>
                    {#each items as item}
                        <CommandItem
                            value={item.value}
                            onSelect={() => {
                                value = item.value;
                                closeAndFocusTrigger();
                            }}
                        >
                            <CheckIcon class={cn('mr-2 size-4', value !== item.value && 'text-transparent')} />
                            {item.label}
                        </CommandItem>
                    {/each}
                </CommandGroup>
            </CommandList>
        </Command>
    </PopoverContent>
</Popover>
