<script lang="ts">
    import AdminForm from '#lib/partials/AdminForm.svelte';
    import type { SerializedLanguage, SerializedEquipmentTypeTranslation, PaginatedEquipments, SerializedEquipmentTypeExtended } from 'backend/types';
    import { Input } from '#lib/components/ui/input';
    import { m } from '#lib/paraglide/messages';
    import * as zod from 'zod';
    import { adminEquipmentTypeValidator } from '#lib/validators/admin/equipment-type';
    import AdminTranslatableNameForm from '#lib/partials/admin/AdminTranslatableNameForm.svelte';
    import ChangeEquipmentInput from '#lib/partials/admin/equipment-type/ChangeEquipmentInput.svelte';

    type Props = {
        languages: SerializedLanguage[];
        equipmentType?: SerializedEquipmentTypeExtended;
        equipmentTypeTranslations?: SerializedEquipmentTypeTranslation[];
        paginatedEquipments: PaginatedEquipments;
    };

    let { languages, equipmentType, equipmentTypeTranslations, paginatedEquipments }: Props = $props();

    let translations: { languageCode: string; name: string }[] = $state([]);
    let code = $state(equipmentType?.code || '');

    const handleError = (): void => {
        translations = buildTranslations(languages, equipmentTypeTranslations);
        code = equipmentType?.code || '';
    };

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
    onError={handleError}
>
    <div class="flex flex-col gap-8">
        <Input name="code" label={m['admin.equipment-type.fields.code.label']()} min={3} max={50} bind:value={code} readonly={!!equipmentType} error={errors.properties?.code?.errors?.[0]} required />
        <ChangeEquipmentInput {paginatedEquipments} equipment={equipmentType?.equipment || paginatedEquipments.equipments[0]} />
        <AdminTranslatableNameForm bind:translations {languages} {errors} />
    </div>
</AdminForm>
