<script lang="ts">
    import { page } from '$app/state';
    import { Title } from '#lib/components/ui/title';
    import { Breadcrumb } from '$lib/components/ui/breadcrumb';
    import { m } from '#lib/paraglide/messages';
    import AdminEquipmentTypeForm from '#lib/partials/admin/equipment-type/AdminEquipmentTypeForm.svelte';
</script>

<Title title={page.data.equipmentType.name} />

<Breadcrumb items={[{ title: m['admin.title'](), href: '/admin' }, { title: m['admin.equipment-type.title'](), href: '/admin/equipment-type' }, { title: page.data.equipmentType.name }]} />

<AdminEquipmentTypeForm languages={page.data.languages} equipmentType={page.data.equipmentType} equipmentTypeTranslations={page.data.equipmentTypeTranslations} />
