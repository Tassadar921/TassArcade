<script lang="ts">
    import { page } from '$app/state';
    import CompanyEquipmentTypeForm from '#lib/partials/profile/company/equipments/CompanyEquipmentTypeForm.svelte';
</script>

<CompanyEquipmentTypeForm companyEquipmentType={page.data.companyEquipment} paginatedEquipments={page.data.equipments} />
