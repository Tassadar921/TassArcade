<script lang="ts">
    import { MapPin, Apple, Map as MapIcon } from '@lucide/svelte';
    import { Button } from '#lib/components/ui/button';

    type Props = {
        latitude: number;
        longitude: number;
        address: string;
    };

    let { latitude, longitude, address }: Props = $props();

    const userAgent: string = navigator.userAgent;
    const isIOS: boolean = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
    const isMac: boolean = /Macintosh/.test(userAgent);
    const isAndroid: boolean = /Android/.test(userAgent);
    const isWindows: boolean = /Win/.test(userAgent);
    const isLinux: boolean = /Linux/.test(userAgent);

    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const appleMapsLink = `https://maps.apple.com/?q=${encodeURIComponent(address)}&ll=${latitude},${longitude}`;

    let finalLink = googleMapsLink;
    let showMacChoice = false;

    if (isIOS) {
        finalLink = appleMapsLink;
    } else if (isMac) {
        showMacChoice = true;
    } else if (isAndroid || isWindows || isLinux) {
        finalLink = googleMapsLink;
    }

    const openLink = (link: string): void => {
        window.open(link, '_blank');
    };
</script>

<div class="flex flex-col items-center p-4">
    <h1 class="text-xl font-semibold mb-4">Localisation</h1>
    <p class="mb-4 text-center">{address}</p>

    {#if showMacChoice}
        <div class="flex space-x-4">
            <Button variant="outline" onclick={() => openLink(appleMapsLink)}>
                <Apple class="size-5" />
                <span>🍏 Apple Maps</span>
            </Button>
            <Button variant="outline" onclick={() => openLink(googleMapsLink)}>
                <MapIcon class="size-5" />
                <span>🗺️ Google Maps</span>
            </Button>
        </div>
    {:else}
        <Button variant="outline" onclick={() => openLink(finalLink)}>
            <MapPin class="size-5" />
            <span>{isIOS ? '🍏 Apple Maps' : '🗺️ Google Maps'}</span>
        </Button>
    {/if}
</div>
