<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import { Title } from '#lib/components/ui/title';
    import Form from '#components/Form.svelte';
    import * as zod from 'zod';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { ComboBox, type SelectItem } from '#lib/components/ui/combo-box';

    interface Country {
        data: {
            code: string;
            name: string;
            flag: string;
        };
    }

    const schema = zod.object({
        siret: zod.number().min(14).max(14),
        name: zod.string().min(3).max(100),
        streetNumber: zod.string().min(1).max(10),
        isBis: zod.boolean(),
        street: zod.string().min(3).max(100),
        zipCode: zod.string().min(5).max(5),
        city: zod.string().min(3).max(100),
        complement: zod.string().optional(),
        country: zod.string().min(2).max(2),
    });

    let countries: SelectItem[] = $state([]);

    const canSubmit = $derived(schema.safeParse({}).success);

    onMount(() => {
        if (page.data.isSuccess) {
            countries = page.data.data.map(({ data: country }: Country): SelectItem => {
                return {
                    value: country.code,
                    label: `${country.flag} ${country.name}`,
                };
            });
        } else {
            // showToast error
        }
    });
</script>

<Title title={m['register-company.title']()} />

<ComboBox items={countries} label={m['register-company.country.label']()} placeholder={m['register-company.country.placeholder']()} noItemFound={m['register-company.country.no-item-found']()} />

<Form isValid={canSubmit}>
    <!--    <Input type="email" name="email" placeholder={m['common.email.placeholder']()} label={m['common.email.label']()} bind:value={email} required />-->
    <!--    <Input type="password" name="password" placeholder={m['common.password.placeholder']()} label={m['common.password.label']()} bind:value={password} required />-->
    <!--    {#snippet links()}-->
    <!--        <div class="w-full flex justify-between flex-col sm:flex-row">-->
    <!--            <Link href="/reset-password">{m['login.forgot-password']()}</Link>-->
    <!--            <Link href="/create-account">{m['login.create-account']()}</Link>-->
    <!--        </div>-->
    <!--    {/snippet}-->
</Form>
