<script lang="ts">
    import type { SerializedEquipment, SerializedEquipmentLight } from 'backend/types';
    import { mode } from 'mode-watcher';

    type Props = {
        equipment: SerializedEquipment | SerializedEquipmentLight;
    };

    let { equipment }: Props = $props();
</script>

<img src={`/assets/equipment-thumbnail/${equipment.id}`} alt={equipment.name} class="size-10 {mode.current === 'dark' ? 'filter invert sepia-100 saturate-500 hue-rotate-180' : ''}" />
