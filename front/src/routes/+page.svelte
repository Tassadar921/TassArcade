<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import { Title } from '#lib/components/ui/title';
    import Meta from '#components/Meta.svelte';
    import { MapLibre } from 'svelte-maplibre';
    import { onMount } from 'svelte';
    import { MultiSelectWithTags } from '#lib/components/ui/multi-select-with-tags';

    let latitude: number = $state(48.866667);
    let longitude: number = $state(2.333333);
    let map: maplibregl.Map;

    onMount((): void => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            },
            (error) => {
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
    };
</script>

<Meta title={m['home.meta.title']()} description={m['home.meta.description']()} keywords={m['home.meta.keywords']().split(', ')} pathname="/" />

<Title title={m['home.title']()} />

<MultiSelectWithTags
    items={[
        { value: 1, label: 'test' },
        { value: 2, label: 'test2' },
        { value: 3, label: 'test3' },
        { value: 4, label: 'test4' },
    ]}
    selectedItems={[]}
/>

<MapLibre bind:map center={[longitude, latitude]} zoom={15} class="h-[800px]" style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" onload={handleLoad} />
