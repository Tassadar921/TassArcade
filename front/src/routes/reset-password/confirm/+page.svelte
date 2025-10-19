<script lang="ts">
    import Form from '#components/Form.svelte';
    import { Title } from '#lib/components/ui/title';
    import { m } from '#lib/paraglide/messages';
    import Meta from '#components/Meta.svelte';
    import { Input } from '#lib/components/ui/input';
    import * as zod from 'zod';
    import { confirmResetPasswordValidator } from '#lib/validators/reset-password';

    interface Props {
        token: string;
    }

    let { token }: Props = $props();

    let password: string = $state('');
    let confirmPassword: string = $state('');

    const validation = $derived(
        confirmResetPasswordValidator.safeParse({
            password,
            confirmPassword,
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

<meta name="robots" content="noindex, nofollow" />
<Meta
    title={m['reset-password.confirm.meta.title']()}
    description={m['reset-password.confirm.meta.description']()}
    keywords={m['reset-password.confirm.meta.keywords']().split(', ')}
    pathname={`/reset-password/confirm/${token}`}
/>

<Title title={m['reset-password.confirm.title']()} hasBackground />

<Form isValid={canSubmit}>
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
</Form>
