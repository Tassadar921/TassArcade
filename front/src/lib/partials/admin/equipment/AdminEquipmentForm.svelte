<script lang="ts">
    import AdminForm from '#lib/partials/AdminForm.svelte';
    import type { SerializedLanguage, SerializedEquipmentTranslation, SerializedEquipmentLight } from 'backend/types';
    import { Input } from '#lib/components/ui/input';
    import { m } from '#lib/paraglide/messages';
    import FileUpload from '#components/FileUpload.svelte';
    import * as zod from 'zod';
    import { adminEquipmentValidator } from '#lib/validators/admin/equipment';

    type Props = {
        languages: SerializedLanguage[];
        equipment?: SerializedEquipmentLight;
        equipmentTranslations?: SerializedEquipmentTranslation[];
    };

    let { languages, equipment, equipmentTranslations }: Props = $props();

    let translations = $derived(
        languages.map((language: SerializedLanguage) => {
            return {
                code: language.code,
                name: equipmentTranslations ? equipmentTranslations.find((translation: SerializedEquipmentTranslation) => translation.language.code === language.code)?.name || '' : '',
            };
        })
    );
    let category = $derived(equipment?.category || '');
    let thumbnail: File | undefined = $state();

    const validation = $derived(
        adminEquipmentValidator.safeParse({
            translations,
            category,
            thumbnail,
        })
    );

    const canSubmit = $derived(validation.success);
    let errors: any = $state({ formErrors: [], properties: {} });

    $effect(() => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
        }
    });

    $effect(() => {
        console.log(equipment?.category, category);
    });
</script>

<AdminForm
    id={equipment?.id}
    {canSubmit}
    deleteTitle={m['admin.equipment.delete.title']({ equipments: [equipment?.category] })}
    deleteText={m['admin.equipment.delete.text']({ equipments: [equipment?.category], count: 1 })}
>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-8">
            <Input
                name="category"
                label={m['admin.equipment.fields.category.label']()}
                min={3}
                max={50}
                bind:value={category}
                readonly={!!equipment}
                error={errors.properties?.category?.errors?.[0]}
                required
            />
            {#each translations as translation}
                <div class="flex flex-col gap-2">
                    <p>{translation.code}</p>
                    <p>{translation.name}</p>
                </div>
            {/each}
        </div>
        <div>
            <FileUpload
                name="thumbnail"
                accept="png jpg jpeg gif webp svg"
                fileName={equipment?.thumbnail?.name}
                title={m['admin.user.new.profile-picture.title']()}
                description={m['admin.user.new.profile-picture.description']()}
                pathPrefix="equipment-thumbnail"
                id={equipment?.id || ''}
                bind:file={thumbnail}
            />
        </div>
    </div>
</AdminForm>
