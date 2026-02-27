<script lang="ts">
    import { page } from '$app/state';
    import { Title } from '#lib/components/ui/title';
    import { Breadcrumb } from '$lib/components/ui/breadcrumb';
    import { m } from '#lib/paraglide/messages';
    import AdminEquipmentForm from '#lib/partials/admin/equipment/AdminEquipmentForm.svelte';

    console.log(page.data.equipment);
</script>

<Title title={page.data.equipment.name} />

<Breadcrumb items={[{ title: m['admin.title'](), href: '/admin' }, { title: m['admin.equipment.title'](), href: '/admin/equipment' }, { title: page.data.equipment.name }]} />

<AdminEquipmentForm languages={page.data.languages} equipment={page.data.equipment} equipmentTranslations={page.data.equipmentTranslations} />
