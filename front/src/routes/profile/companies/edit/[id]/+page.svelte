<script lang="ts">
    import { page } from '$app/state';
    import AdminCompanyForm from '#lib/partials/profile/company/AdminCompanyForm.svelte';
</script>

<AdminCompanyForm company={page.data.company} />
