<script lang="ts">
    import { Input } from '#lib/components/ui/input';

    interface Country {
        data: {
            code: string;
            name: string;
            dial_code: string;
            flag: string;
        };
    }

    interface Props {
        name?: string;
        placeholder: string;
        label: string;
        value: string;
        country?: Country | null;
    }

    let { name = 'phoneNumber', placeholder, label, value = $bindable(), country = null }: Props = $props();

    const hasCountry = $derived(!!country);
    const dialCode = $derived(hasCountry ? country?.data.dial_code : '');
</script>

<div class="relative flex w-full items-center">
    {#if hasCountry}
        <div class="flex items-center gap-2 px-2 h-9 border border-input rounded-l-md bg-muted text-sm select-none">
            <span>{country?.data.flag}</span>
            <span>{dialCode}</span>
        </div>

        <Input class="rounded-l-none flex-1" type="text" {name} {placeholder} {label} bind:value />
    {:else}
        <Input type="text" {name} {placeholder} {label} bind:value readonly disabled class="opacity-50 cursor-not-allowed" />
    {/if}
</div>
