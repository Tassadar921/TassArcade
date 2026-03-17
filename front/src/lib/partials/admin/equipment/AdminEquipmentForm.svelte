<script lang="ts">
    import AdminForm from '#lib/partials/AdminForm.svelte';
    import type { SerializedLanguage, SerializedEquipmentTranslation, SerializedEquipmentLight } from 'backend/types';
    import { Input } from '#lib/components/ui/input';
    import { m } from '#lib/paraglide/messages';
    import FileUpload from '#components/FileUpload.svelte';
    import * as zod from 'zod';
    import { adminEquipmentValidator } from '#lib/validators/admin/equipment';
    import AdminTranslatableNameForm from '#lib/partials/admin/AdminTranslatableNameForm.svelte';

    type Props = {
        languages: SerializedLanguage[];
        equipment?: SerializedEquipmentLight;
        equipmentTranslations?: SerializedEquipmentTranslation[];
    };

    let { languages, equipment, equipmentTranslations }: Props = $props();

    let translations: { languageCode: string; name: string }[] = $state([]);
    let category = $state(equipment?.category || '');
    let thumbnail: File | undefined = $state();

    const handleError = (): void => {
        translations = buildTranslations(languages, equipmentTranslations);
        category = equipment?.category || '';
    };

    const buildTranslations = (languages: SerializedLanguage[], equipmentTranslations?: SerializedEquipmentTranslation[]): { languageCode: string; name: string }[] => {
        return languages.map((language) => ({
            languageCode: language.code,
            name: equipmentTranslations?.find((t) => t.language.code === language.code)?.name ?? '',
        }));
    };

    const validation = $derived(
        adminEquipmentValidator.safeParse({
            category,
            translations,
            thumbnail,
        })
    );

    const canSubmit = $derived(validation.success);
    let errors: any = $state({ formErrors: [], properties: {} });

    $effect((): void => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
        }
    });

    $effect((): void => {
        translations = buildTranslations(languages, equipmentTranslations);
    });
</script>

<AdminForm
    id={equipment?.id}
    {canSubmit}
    deleteTitle={m['admin.equipment.delete.title']({ equipments: [equipment?.category] })}
    deleteText={m['admin.equipment.delete.text']({ equipments: [equipment?.category], count: 1 })}
    onError={handleError}
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
            <AdminTranslatableNameForm bind:translations {languages} {errors} />
        </div>
        <div>
            <FileUpload
                name="thumbnail"
                accept="svg"
                fileName={equipment?.thumbnail?.name}
                title={m['admin.equipment.fields.thumbnail.title']()}
                description={m['admin.equipment.fields.thumbnail.description']()}
                pathPrefix="equipment-thumbnail"
                id={equipment?.id || ''}
                bind:file={thumbnail}
            />
        </div>
    </div>
</AdminForm>
