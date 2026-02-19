<script lang="ts">
    import { page } from '$app/state';
    import CompanyForm from '#lib/partials/profile/company/CompanyForm.svelte';
</script>

<CompanyForm company={page.data.company} />
