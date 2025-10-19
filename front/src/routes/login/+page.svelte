<script lang="ts">
    import Form from '#components/Form.svelte';
    import { Title } from '#lib/components/ui/title';
    import { m } from '#lib/paraglide/messages';
    import OauthProviders from '#lib/partials/login/OauthProviders.svelte';
    import Meta from '#components/Meta.svelte';
    import { Input } from '#lib/components/ui/input';
    import { Link } from '#lib/components/ui/link';
    import * as zod from 'zod';
    import { loginValidator } from '#lib/validators/login';

    let email: string = $state('');
    let password: string = $state('');

    const validation = $derived(
        loginValidator.safeParse({
            email,
            password,
        })
    );

    const canSubmit = $derived(validation.success);
    let errors: any = $state({ formErrors: [], properties: {} });

    $effect(() => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
        }
    });
</script>

<Meta title={m['login.meta.title']()} description={m['login.meta.description']()} keywords={m['login.meta.keywords']().split(', ')} pathname="/login" />

<Title title={m['login.title']()} hasBackground />

<Form isValid={canSubmit}>
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
    {#snippet links()}
        <div class="w-full flex justify-between flex-col sm:flex-row">
            <Link href="/reset-password">{m['login.forgot-password']()}</Link>
            <Link href="/create-account">{m['login.create-account']()}</Link>
        </div>
    {/snippet}
    {#snippet footer()}
        <OauthProviders />
    {/snippet}
</Form>
