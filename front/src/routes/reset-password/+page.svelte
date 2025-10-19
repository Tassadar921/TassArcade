<script lang="ts">
    import { Title } from '#lib/components/ui/title';
    import Form from '#components/Form.svelte';
    import { Input } from '#lib/components/ui/input';
    import { m } from '#lib/paraglide/messages';
    import { profile } from '#lib/stores/profileStore';
    import Meta from '#components/Meta.svelte';
    import * as zod from 'zod';
    import { onMount } from 'svelte';
    import { resetPasswordValidator } from '#lib/validators/reset-password';

    let email: string = $state('');

    const validation = $derived(
        resetPasswordValidator.safeParse({
            email,
        })
    );

    let readonly: boolean = $state(false);
    const canSubmit = $derived(validation.success);
    let errors: any = $state({ formErrors: [], properties: {} });

    onMount((): void => {
        if ($profile) {
            email = $profile.email;
            readonly = true;
        }
    });

    $effect(() => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
        }
    });
</script>

<Meta title={m['reset-password.meta.title']()} description={m['reset-password.meta.description']()} keywords={m['reset-password.meta.keywords']().split(', ')} pathname="/reset-password" />

<Title title={m['reset-password.title']()} hasBackground />

<Form isValid={canSubmit}>
    <Input
        label={m['common.email.label']()}
        placeholder={m['common.email.placeholder']()}
        type="email"
        name="email"
        bind:value={email}
        error={errors.properties?.email?.errors?.[0]}
        {readonly}
        required
    />
</Form>
