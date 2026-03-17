<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import { Input } from '#lib/components/ui/input';
    import * as zod from 'zod';
    import AdminForm from '#lib/partials/AdminForm.svelte';
    import type { PaginatedEquipments, SerializedCompanyEquipmentType } from 'backend/types';
    import { companyEquipmentTypeValidator } from '#lib/validators/company-equipment-type';
    import ChangeCompanyEquipmentTypeInput from '#lib/partials/profile/company/equipments/ChangeCompanyEquipmentTypeInput.svelte';

    type Props = {
        companyEquipmentType: SerializedCompanyEquipmentType;
        paginatedEquipments: PaginatedEquipments;
    };

    let { companyEquipmentType, paginatedEquipments }: Props = $props();

    let name: string | undefined = $derived(companyEquipmentType.name);
    let description: string | undefined = $derived(companyEquipmentType.description);

    const validation = $derived(
        companyEquipmentTypeValidator.safeParse({
            name,
            description,
        })
    );

    const canSubmit = $derived(validation.success && !!(name || description));
    let errors: any = $state({ formErrors: [], properties: {} });

    const handleError = (): void => {
        name = companyEquipmentType.name;
        description = companyEquipmentType.description;
    };

    $effect((): void => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
        }
    });
</script>

<AdminForm
    id={companyEquipmentType.id}
    {canSubmit}
    deleteTitle={m['company.edit.equipments.delete.title']({ equipments: [companyEquipmentType.name ?? companyEquipmentType.type.name] })}
    deleteText={m['company.edit.equipments.delete.text']({ equipments: [companyEquipmentType.name ?? companyEquipmentType.type.name], count: 1 })}
    onError={handleError}
>
    <Input
        type="text"
        name="name"
        placeholder={m['company.edit.equipments.fields.name.placeholder']()}
        label={m['company.edit.equipments.fields.name.label']()}
        bind:value={name}
        error={errors.properties?.name?.errors?.[0]}
    />
    <Input
        type="text"
        name="description"
        placeholder={m['company.edit.equipments.fields.description.placeholder']()}
        label={m['company.edit.equipments.fields.description.label']()}
        bind:value={description}
        error={errors.properties?.description?.errors?.[0]}
    />
    <ChangeCompanyEquipmentTypeInput {paginatedEquipments} equipmentType={companyEquipmentType.type} />
</AdminForm>
