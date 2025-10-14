<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import { Title } from '#lib/components/ui/title';
    import Form from '#components/Form.svelte';
    import * as zod from 'zod';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { ComboBox, type SelectItem } from '#lib/components/ui/combo-box';
    import { Input } from '#lib/components/ui/input';
    import { showToast } from '#lib/services/toastService';
    import { Button } from '#lib/components/ui/button';
    import { RefreshCcw } from '@lucide/svelte';
    import PhoneNumber from '#components/PhoneNumber.svelte';

    interface Country {
        data: {
            code: string;
            name: string;
            dial_code: string;
            flag: string;
        };
    }

    const schema = zod.object({
        siret: zod.number().min(14).max(14),
        name: zod.string().min(3).max(100),
        email: zod.email().max(100).optional(),
        phoneNumber: zod.string().max(20).optional(),
        address: zod.string().min(5).max(100),
        postalCode: zod.string().min(5).max(5),
        city: zod.string().min(3).max(100),
        complement: zod.string().optional(),
        country: zod.string().min(2).max(2).uppercase(),
    });

    let siret: number = $state(10000000000000);
    let name: string = $state('');
    let address: string = $state('');
    let postalCode: string = $state('');
    let city: string = $state('');
    let complement: string = $state('');
    let countryCode: string | undefined = $state('');
    let email: string = $state('');
    let phoneNumber: string = $state('');

    const canSubmit = $derived(schema.safeParse({}).success);

    let countriesOptions: SelectItem[] = $state([]);
    let selectedCountry: Country | undefined = $derived(page.data.data.find((country: Country) => country.data.code === countryCode));

    onMount(() => {
        if (page.data.isSuccess) {
            countriesOptions = page.data.data.map(({ data: country }: Country): SelectItem => {
                return {
                    value: country.code,
                    label: `${country.flag} ${country.name}`,
                };
            });
        } else {
            showToast(page.data.message, 'error');
        }
    });
</script>

<Title title={m['register-company.title']()} />

<Form isValid={canSubmit}>
    <div>
        <div class="flex gap-3">
            <Input
                type="number"
                name="siret"
                placeholder={m['register-company.siret.placeholder']()}
                label={m['register-company.siret.label']()}
                bind:value={siret}
                required
                min={10000000000000}
                max={99999999999999}
            />
            <Button variant="outline">
                <RefreshCcw />
            </Button>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300">{m['register-company.siret.comment']()}</p>
    </div>
    <Input type="text" name="name" placeholder={m['register-company.name.placeholder']()} label={m['register-company.name.label']()} bind:value={name} required />
    <div class="flex flex-col gap-3">
        <Input type="text" name="address" placeholder={m['register-company.address.placeholder']()} label={m['register-company.address.label']()} bind:value={address} required />
        <div class="flex gap-5">
            <Input type="text" name="postalCode" placeholder={m['register-company.postal-code.placeholder']()} label={m['register-company.postal-code.label']()} bind:value={postalCode} required />
            <Input type="text" name="city" placeholder={m['register-company.city.placeholder']()} label={m['register-company.city.label']()} bind:value={city} required />
        </div>
        <Input type="text" name="complement" placeholder={m['register-company.complement.placeholder']()} label={m['register-company.complement.label']()} bind:value={complement} />
        <ComboBox
            items={countriesOptions}
            placeholder={m['register-company.country.placeholder']()}
            searchPlaceholder={m['register-company.country.search-placeholder']()}
            noItemFound={m['register-company.country.no-item-found']()}
            bind:value={countryCode}
        />
    </div>
    <div class="flex gap-5">
        <Input type="email" name="email" placeholder={m['register-company.email.placeholder']()} label={m['register-company.email.label']()} bind:value={email} />
        <PhoneNumber
            country={selectedCountry}
            name="phoneNumber"
            placeholder={m['register-company.phone-number.placeholder']()}
            label={m['register-company.phone-number.label']()}
            bind:value={phoneNumber}
        />
    </div>
</Form>
