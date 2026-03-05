<script lang="ts">
    import AdminForm from '#lib/partials/AdminForm.svelte';
    import type { SerializedLanguage, SerializedEquipmentType, SerializedEquipmentTypeTranslation } from 'backend/types';
    import { Input } from '#lib/components/ui/input';
    import { m } from '#lib/paraglide/messages';
    import * as zod from 'zod';
    import { adminEquipmentTypeValidator } from '#lib/validators/admin/equipment-type';

    type Props = {
        languages: SerializedLanguage[];
        equipmentType?: SerializedEquipmentType;
        equipmentTypeTranslations?: SerializedEquipmentTypeTranslation[];
    };

    let { languages, equipmentType, equipmentTypeTranslations }: Props = $props();

    let translations: { languageCode: string; name: string }[] = $state([]);
    let code = $state(equipmentType?.code || '');

    const buildTranslations = (languages: SerializedLanguage[], equipmentTypeTranslations?: SerializedEquipmentTypeTranslation[]): { languageCode: string; name: string }[] => {
        return languages.map((language) => ({
            languageCode: language.code,
            name: equipmentTypeTranslations?.find((t) => t.language.code === language.code)?.name ?? '',
        }));
    };

    const validation = $derived(
        adminEquipmentTypeValidator.safeParse({
            code,
            translations,
        })
    );

    const canSubmit = $derived(validation.success);
    let errors: any = $state({ formErrors: [], properties: {} });

    $effect((): void => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
            console.log(errors);
        }
    });

    $effect((): void => {
        translations = buildTranslations(languages, equipmentTypeTranslations);
    });
</script>

<AdminForm
    id={equipmentType?.id}
    {canSubmit}
    deleteTitle={m['admin.equipment-type.delete.title']({ equipmentTypes: [equipmentType?.code] })}
    deleteText={m['admin.equipment-type.delete.text']({ equipmentTypes: [equipmentType?.code], count: 1 })}
>
    <div class="flex flex-col gap-8">
        <Input
            name="category"
            label={m['admin.equipment-type.fields.code.label']()}
            min={3}
            max={50}
            bind:value={code}
            readonly={!!equipmentType}
            error={errors.properties?.code?.errors?.[0]}
            required
        />
        <input type="hidden" name="translations" value={JSON.stringify(translations)} />
        {#each languages as language}
            {@const translationIndex = translations.findIndex((t) => t.languageCode === language.code)}
            {@const translation = translationIndex >= 0 ? translations[translationIndex] : null}
            {#if translation}
                <div class="flex flex-col gap-2">
                    <div class="flex gap-3">
                        <img src={`/assets/language-flag/${language.id}`} alt={language.name} class="size-10" />
                        <Input
                            name=""
                            label={m['common.name']()}
                            min={3}
                            max={50}
                            bind:value={translation.name}
                            error={errors.properties?.translations?.items?.[translationIndex]?.properties?.name?.errors?.[0]}
                            required
                        />
                    </div>
                </div>
            {/if}
        {/each}
    </div>
</AdminForm>
