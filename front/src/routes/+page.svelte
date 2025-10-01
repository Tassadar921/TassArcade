<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import { Title } from '#lib/components/ui/title';
    import Meta from '#components/Meta.svelte';
    import { MapLibre, Control, ScaleControl } from 'svelte-maplibre';
    import { onMount } from 'svelte';
    import { MultiSelectWithTags } from '#lib/components/ui/multi-select-with-tags';
    import { page } from '$app/state';
    import type { SerializedEquipment, SerializedEquipmentType } from 'backend/types';
    import MapControls from '#lib/partials/map/MapControls.svelte';
    import { mode } from 'mode-watcher';

    let latitude: number = $state(48.866667);
    let longitude: number = $state(2.333333);

    const styles = {
        light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    };

    let current: 'light' | 'dark' = $state(mode.current === 'dark' ? 'dark' : 'light');

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
        map.setStyle(styles[current]);
    };
</script>

<Meta title={m['home.meta.title']()} description={m['home.meta.description']()} keywords={m['home.meta.keywords']().split(', ')} pathname="/" />

<Title title={m['home.title']()} />

<MultiSelectWithTags
    categories={page.data.data.map((equipment: SerializedEquipment) => ({
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
    zoom={15}
    attributionControl={false}
    onload={handleLoad}
>
    {#snippet children({ map })}
        <ScaleControl />
        <Control>
            <MapControls {map} bind:current {styles} />
        </Control>
    {/snippet}
</MapLibre>
