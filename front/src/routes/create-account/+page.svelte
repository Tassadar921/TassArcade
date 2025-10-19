<script lang="ts">
    import Form from '#components/Form.svelte';
    import { Title } from '#lib/components/ui/title';
    import { m } from '#lib/paraglide/messages';
    import { Input } from '#lib/components/ui/input';
    import OauthProviders from '#lib/partials/login/OauthProviders.svelte';
    import Meta from '#components/Meta.svelte';
    import { Switch } from '#lib/components/ui/switch';
    import { createAccountValidator } from '#lib/validators/create-account';
    import * as zod from 'zod';

    let username: string = $state('');
    let email: string = $state('');
    let password: string = $state('');
    let confirmPassword: string = $state('');
    let consent: boolean = $state(false);

    const validation = $derived(
        createAccountValidator.safeParse({
            username,
            email,
            password,
            confirmPassword,
            consent,
        })
    );

    const canSubmit = $derived(validation.success);
    let errors: any = $state({ formErrors: [], properties: {} });
    let confirmPasswordError: string | undefined = $derived(password === confirmPassword ? undefined : m['common.password.error.match']());

    $effect(() => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
        }
    });
</script>

<Meta title={m['create-account.meta.title']()} description={m['create-account.meta.description']()} keywords={m['create-account.meta.keywords']().split(', ')} pathname="/create-account" />

<Title title={m['create-account.title']()} hasBackground />

<Form isValid={canSubmit}>
    <Input name="username" placeholder={m['common.username.placeholder']()} label={m['common.username.label']()} bind:value={username} error={errors.properties?.username?.errors?.[0]} required />
    <Input type="email" name="email" placeholder={m['common.email.placeholder']()} label={m['common.email.label']()} bind:value={email} error={errors.properties?.email?.errors?.[0]} required />
    <Input
        type="password"
        name="password"
        placeholder={m['common.password.placeholder']()}
        label={m['common.password.label']()}
        bind:value={password}
        error={errors.properties?.password?.errors?.[0]}
        required
    />
    <Input
        type="password"
        name="confirm-password"
        placeholder={m['common.confirm-password.placeholder']()}
        label={m['common.confirm-password.label']()}
        bind:value={confirmPassword}
        error={confirmPasswordError}
        required
    />
    <Switch name="consent" label={m['common.consent']()} bind:checked={consent} required />
    {#snippet footer()}
        <OauthProviders />
    {/snippet}
</Form>
