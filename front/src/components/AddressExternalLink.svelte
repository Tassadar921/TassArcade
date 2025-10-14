<script lang="ts">
    import { ExternalLink } from '@lucide/svelte';
    import { Link } from '#lib/components/ui/link';

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

    const googleMapsLink: string = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const appleMapsLink: string = `https://maps.apple.com/?q=${encodeURIComponent(address)}&ll=${latitude},${longitude}`;

    let finalLink: string = $state(googleMapsLink);
    let showMacChoice: boolean = $state(false);

    if (isIOS) {
        finalLink = appleMapsLink;
    } else if (isMac) {
        finalLink = appleMapsLink;
        showMacChoice = true;
    } else if (isAndroid || isWindows || isLinux) {
        finalLink = googleMapsLink;
    }
</script>

<div class="flex flex-col items-center">
    <Link href={finalLink} target="_blank" class="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400">{address}<ExternalLink class="size-4" /></Link>

    {#if showMacChoice}
        <div class="flex space-x-4">
            <Link href={appleMapsLink} target="_blank">
                <span>Apple Maps</span>
                <ExternalLink class="size-4" />
            </Link>

            <Link href={googleMapsLink} target="_blank">
                <span>Google Maps</span>
                <ExternalLink class="size-4" />
            </Link>
        </div>
    {/if}
</div>
