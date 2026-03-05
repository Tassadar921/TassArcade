<script lang="ts">
    import { Title } from '#lib/components/ui/title';
    import { m } from '#lib/paraglide/messages';
    import { Breadcrumb } from '#lib/components/ui/breadcrumb';
    import { page } from '$app/state';
    import AdminEquipmentTypeForm from '#lib/partials/admin/equipment-type/AdminEquipmentTypeForm.svelte';
</script>

<Title title={m['admin.equipment-type.new.title']()} />

<Breadcrumb items={[{ title: m['admin.title'](), href: '/admin' }, { title: m['admin.equipment-type.title'](), href: '/admin/equipment-type' }, { title: m['admin.equipment-type.new.title']() }]} />

<AdminEquipmentTypeForm languages={page.data.languages} />
