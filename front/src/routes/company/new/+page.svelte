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
    import { wrappedFetch } from '#lib/services/requestService';
    import { Popover, PopoverContent } from '#lib/components/ui/popover';
    import { PopoverTrigger } from '#lib/components/ui/popover/index.js';
    import { formatForCompany } from '#lib/services/stringService';

    interface Country {
        data: {
            code: string;
            name: string;
            dial_code: string;
            flag: string;
        };
    }

    const schema = zod.object({
        siret: zod.string().length(14),
        name: zod.string().min(3).max(100),
        address: zod.string().min(5).max(100),
        postalCode: zod.string().min(5).max(5),
        city: zod.string().min(3).max(100),
        complement: zod.string().optional(),
        countryCode: zod.string().min(2).max(2).uppercase(),
        email: zod.email().max(100).optional(),
        phoneNumber: zod.string().max(20).optional(),
    });

    let siret: string = $state('10000000000000');
    let name: string = $state('');
    let address: string = $state('');
    let postalCode: string = $state('');
    let city: string = $state('');
    let complement: string = $state('');
    let countryCode: string | undefined = $state('');
    let email: string = $state('');
    let phoneNumber: string = $state('');

    let isSirenInvalid: boolean = $derived(siret.length !== 14 || !Number(siret));
    let showSiretPopover: boolean = $state(false);

    const canSubmit = $derived(
        schema.safeParse({
            siret,
            name,
            address,
            postalCode,
            city,
            complement,
            countryCode,
            email,
            phoneNumber,
        }).success
    );

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

    const fillFromSiret = async (): Promise<void> => {
        if (isSirenInvalid) {
            showToast(m['company.new.siret.error.invalid'](), 'error');
            return;
        }

        await wrappedFetch(`/company/new/siret/${siret}`, { method: 'GET' }, ({ data }): void => {
            console.log(data);
            name = formatForCompany(data.periodesEtablissement[0]?.denominationUsuelleEtablissement);
            address = formatForCompany(
                `${data.adresseEtablissement.numeroVoieEtablissement} ${data.adresseEtablissement.typeVoieEtablissement} ${data.adresseEtablissement.libelleVoieEtablissement}`,
                3
            );
            postalCode = data.adresseEtablissement.codePostalEtablissement;
            city = formatForCompany(data.adresseEtablissement.libelleCommuneEtablissement);
            complement = formatForCompany(data.adresseEtablissement.complementAdresseEtablissement);
        });
    };

    $effect(() => {
        console.log(phoneNumber);
    });
</script>

<Title title={m['company.new.title']()} />

<Form isValid={canSubmit}>
    <div>
        <div class="flex gap-3">
            <Input name="siret" placeholder={m['company.new.siret.placeholder']()} label={m['company.new.siret.label']()} bind:value={siret} max={14} required />
            <Popover open={showSiretPopover}>
                <Button
                    disabled={isSirenInvalid}
                    variant="outline"
                    onmouseenter={() => (showSiretPopover = true)}
                    onfocus={() => (showSiretPopover = true)}
                    onmouseleave={() => (showSiretPopover = false)}
                    onblur={() => (showSiretPopover = false)}
                    onclick={fillFromSiret}
                >
                    <div class="relative">
                        <RefreshCcw />
                        <PopoverTrigger class="absolute top-8 size-0" />
                    </div>
                </Button>
                <PopoverContent>{m['company.new.siret.popover.content']()}</PopoverContent>
            </Popover>
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300">{m['company.new.siret.comment']()}</p>
    </div>
    <Input type="text" name="name" placeholder={m['company.new.name.placeholder']()} label={m['company.new.name.label']()} bind:value={name} required />
    <Input type="text" name="address" placeholder={m['company.new.address.placeholder']()} label={m['company.new.address.label']()} bind:value={address} required />
    <div class="flex gap-5">
        <Input type="text" name="postalCode" placeholder={m['company.new.postal-code.placeholder']()} label={m['company.new.postal-code.label']()} bind:value={postalCode} required />
        <Input type="text" name="city" placeholder={m['company.new.city.placeholder']()} label={m['company.new.city.label']()} bind:value={city} required />
    </div>
    <Input type="text" name="complement" placeholder={m['company.new.complement.placeholder']()} label={m['company.new.complement.label']()} bind:value={complement} />
    <ComboBox
        items={countriesOptions}
        placeholder={m['company.new.country.placeholder']()}
        searchPlaceholder={m['company.new.country.search-placeholder']()}
        noItemFound={m['company.new.country.no-item-found']()}
        bind:value={countryCode}
    />
    <div class="flex gap-5">
        <Input type="email" name="email" placeholder={m['company.new.email.placeholder']()} label={m['company.new.email.label']()} bind:value={email} />
        <PhoneNumber country={selectedCountry} name="phoneNumber" placeholder={m['company.new.phone-number.placeholder']()} label={m['company.new.phone-number.label']()} bind:value={phoneNumber} />
    </div>
</Form>
