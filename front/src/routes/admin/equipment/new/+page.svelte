<script lang="ts">
    import { Title } from '#lib/components/ui/title';
    import { m } from '#lib/paraglide/messages';
    import { Breadcrumb } from '#lib/components/ui/breadcrumb';
    import AdminEquipmentForm from '#lib/partials/admin/equipment/AdminEquipmentForm.svelte';
    import { page } from '$app/state';
</script>

<Title title={m['admin.equipment.new.title']()} />

<Breadcrumb items={[{ title: m['admin.title'](), href: '/admin' }, { title: m['admin.equipment.title'](), href: '/admin/equipment' }, { title: m['admin.equipment.new.title']() }]} />

<AdminEquipmentForm languages={page.data.languages} />
