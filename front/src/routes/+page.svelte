<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import { Title } from '#lib/components/ui/title';
    import Meta from '#components/Meta.svelte';
    import { MapLibre, Control, ScaleControl, type MapMoveEvent, Marker } from 'svelte-maplibre';
    import { onMount } from 'svelte';
    import { MultiSelectWithTags } from '#lib/components/ui/multi-select-with-tags';
    import { page } from '$app/state';
    import type { Cluster, SerializedCompanyEquipmentType, SerializedEquipment, SerializedEquipmentType, SerializedEquipmentLight, SerializedCompany } from 'backend/types';
    import MapControls from '#lib/partials/map/MapControls.svelte';
    import { mode } from 'mode-watcher';
    import { wrappedFetch } from '#lib/services/requestService';
    import { MapPinned, MapPin } from '@lucide/svelte';
    import { Dialog, DialogContent, DialogPortal } from '#lib/components/ui/dialog';
    import { goto } from '$app/navigation';
    import CompanyDialogContent from '#lib/partials/map/CompanyDialogContent.svelte';

    let latitude: number = $state(page.data.latitude);
    let longitude: number = $state(page.data.longitude);
    let clusters: Cluster[] = $state([]);
    let selectedCompany: SerializedCompany | null = $state(null);
    let reorganizedEquipments: Record<string, { category: SerializedEquipmentLight; items: SerializedCompanyEquipmentType[] }> | undefined = $state();

    const styles = {
        light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    };

    let showModal: boolean = $state(false);
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

        const url: URL = new URL(page.url);
        const initialCompany: string | null = url.searchParams.get('company');

        await wrappedFetch(
            `/map/clusters?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}&zoom=${zoom}${initialCompany ? `&company=${initialCompany}` : ''}`,
            { method: 'GET' },
            ({ data }): void => {
                clusters = data.clusters;
                if (initialCompany) {
                    if (data.company) {
                        handleMarkerClick({ companies: [data.company] });
                    } else {
                        handleCloseCompanyDialog();
                    }
                }
            }
        );
    };

    const handleMarkerClick = (point: Partial<Cluster>): void => {
        selectedCompany = point.companies![0];
        reorganizedEquipments = selectedCompany.equipments.reduce(
            (acc, equipmentType) => {
                const category = equipmentType.category;
                if (!acc[category.id]) {
                    acc[category.id] = {
                        category: category,
                        items: [],
                    };
                }
                acc[category.id].items.push(equipmentType);
                return acc;
            },
            {} as Record<string, { category: SerializedEquipmentLight; items: SerializedCompanyEquipmentType[] }>
        );
        const url: URL = new URL(page.url);
        url.searchParams.set('company', selectedCompany.id);
        showModal = true;
        goto(url);
    };

    const handleCloseCompanyDialog = () => {
        selectedCompany = null;
        const url: URL = new URL(page.url);
        url.searchParams.delete('company');
        goto(url);
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

<Dialog bind:open={showModal} onOpenChange={handleCloseCompanyDialog}>
    <DialogPortal>
        <DialogContent class="min-w-[90%] md:min-w-[750px]">
            <CompanyDialogContent {selectedCompany} {reorganizedEquipments} />
        </DialogContent>
    </DialogPortal>
</Dialog>
