<script lang="ts">
    import { Sun, Moon } from '@lucide/svelte';
    import { ControlGroup, ControlButton, FullscreenControl, NavigationControl } from 'svelte-maplibre';

    type Props = {
        map: maplibregl.Map;
        currentMapTheme: 'light' | 'dark';
        styles: Record<'light' | 'dark', string>;
    };

    let { map, currentMapTheme = $bindable(), styles }: Props = $props();

    const toggle = (): void => {
        if (!map) {
            return;
        }

        currentMapTheme = currentMapTheme === 'light' ? 'dark' : 'light';
        map.setStyle(styles[currentMapTheme]);
    };
</script>

<NavigationControl position="top-left" />
<FullscreenControl position="top-left" />
<ControlGroup>
    <ControlButton class="flex items-center justify-center {currentMapTheme === 'light' ? 'bg-white' : 'bg-gray-800'}" onclick={toggle}>
        {#if currentMapTheme === 'dark'}
            <Sun class="size-6 text-gray-200 transition-all" />
        {:else}
            <Moon class="size-6 text-gray-800 transition-all" />
        {/if}
    </ControlButton>
</ControlGroup>
