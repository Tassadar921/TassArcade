<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import { Title } from '#lib/components/ui/title';
    import Meta from '#components/Meta.svelte';
    import { MapLibre, Control, ScaleControl, type MapMoveEvent, Marker } from 'svelte-maplibre';
    import { onMount } from 'svelte';
    import { MultiSelectWithTags } from '#lib/components/ui/multi-select-with-tags';
    import { page } from '$app/state';
    import type { Cluster, SerializedEquipment, SerializedEquipmentType } from 'backend/types';
    import MapControls from '#lib/partials/map/MapControls.svelte';
    import { mode } from 'mode-watcher';
    import { wrappedFetch } from '#lib/services/requestService';
    import { MapPinned, MapPin } from '@lucide/svelte';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogPortal } from '#lib/components/ui/dialog';
    import AddressExternalLink from '#components/AddressExternalLink.svelte';

    let latitude: number = $state(page.data.latitude);
    let longitude: number = $state(page.data.longitude);
    let clusters: Cluster[] = $state([]);
    let selectedPoint: Cluster | null = $state(null);

    const styles = {
        light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    };

    let showModal = $state(false);
    let currentMapTheme: 'light' | 'dark' = $state(mode.current === 'dark' ? 'dark' : 'light');

    onMount((): void => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            },
            (error: GeolocationPositionError) => {
                console.error(error);
            }
        );
    });

    const handleLoad = (map: maplibregl.Map): void => {
        map.setPitch(0);
        map.setBearing(0);

        if (typeof map.setMaxPitch === 'function') {
            map.setMaxPitch(0);
        }

        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
        map.setStyle(styles[currentMapTheme]);
    };

    const fetchClusters = async (event: MapMoveEvent): Promise<void> => {
        const bounds = event.target.getBounds();
        const minLat: number = bounds.getSouth();
        const maxLat: number = bounds.getNorth();
        const minLng: number = bounds.getWest();
        const maxLng: number = bounds.getEast();
        const zoom: number = event.target.getZoom();

        await wrappedFetch(`/map/clusters?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}&zoom=${zoom}`, { method: 'GET' }, ({ data }): void => {
            clusters = data;
        });
    };

    const handleMarkerClick = (point: Cluster): void => {
        console.log('ici');
        selectedPoint = point;
        showModal = true;
    };
</script>

<Meta title={m['home.meta.title']()} description={m['home.meta.description']()} keywords={m['home.meta.keywords']().split(', ')} pathname="/" />

<Title title={m['home.title']()} />

<MultiSelectWithTags
    categories={page.data.equipments.map((equipment: SerializedEquipment) => ({
        label: equipment.name,
        thumbnailPath: `/assets/equipment-thumbnail/${equipment.id}`,
        items: equipment.types.map((type: SerializedEquipmentType) => ({
            value: type.id,
            label: type.name,
            category: equipment.name,
        })),
    }))}
    selectedItems={[]}
/>

<MapLibre
    center={[longitude, latitude]}
    style={'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'}
    class="relative w-full aspect-[9/16] h-[800px] sm:max-h-full sm:aspect-video"
    zoom={7}
    attributionControl={false}
    onload={handleLoad}
    onmoveend={fetchClusters}
    onzoom={fetchClusters}
>
    {#snippet children({ map })}
        <ScaleControl />
        <Control>
            <MapControls {map} bind:currentMapTheme {styles} />
        </Control>
        {#each clusters as point}
            {#if point.isCluster}
                <Marker lngLat={[point.lng, point.lat]}>
                    <MapPinned class={currentMapTheme === 'dark' ? 'text-white' : 'text-black'} />
                </Marker>
            {:else}
                <Marker lngLat={[point.lng, point.lat]} onclick={() => handleMarkerClick(point)}>
                    <MapPin class={currentMapTheme === 'dark' ? 'text-white' : 'text-black'} />
                </Marker>
            {/if}
        {/each}
    {/snippet}
</MapLibre>

<Dialog bind:open={showModal}>
    <DialogPortal>
        <DialogContent>
            {#if selectedPoint}
                <DialogHeader>
                    <DialogTitle>{selectedPoint.companies[0].name}</DialogTitle>
                    <DialogDescription>
                        <AddressExternalLink latitude={selectedPoint.lat} longitude={selectedPoint.lng} address={selectedPoint.companies[0].address.fullAddress} />
                    </DialogDescription>
                </DialogHeader>
                {#each selectedPoint.companies[0].equipments as equipment}
                    <p>{equipment.name}</p>
                {/each}
            {/if}
        </DialogContent>
    </DialogPortal>
</Dialog>
