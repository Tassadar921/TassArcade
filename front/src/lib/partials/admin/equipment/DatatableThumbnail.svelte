<script lang="ts">
    import type { SerializedEquipment } from 'backend/types';
    import { mode } from 'mode-watcher';

    type Props = {
        equipment: SerializedEquipment;
    };

    let { equipment }: Props = $props();
</script>

<img src={`/assets/equipment-thumbnail/${equipment.id}`} alt={equipment.name} class="size-10 {mode.current === 'dark' ? 'filter invert sepia-100 saturate-500 hue-rotate-180' : ''}" />
