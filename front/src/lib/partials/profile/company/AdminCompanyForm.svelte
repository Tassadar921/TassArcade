<script lang="ts">
    import { m } from '#lib/paraglide/messages';
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
    import { PopoverTrigger } from '#lib/components/ui/popover';
    import { formatForCompany } from '#lib/services/stringService';
    import { companyValidator } from '#lib/validators/company';
    import * as zod from 'zod';
    import AdminForm from '#lib/partials/AdminForm.svelte';
    import type { SerializedCompany } from 'backend/types';
    import ConfirmCompanyForm from '#lib/partials/profile/company/ConfirmCompanyForm.svelte';
    import FileUpload from '#components/FileUpload.svelte';

    type Props = {
        company?: SerializedCompany;
    };

    let { company }: Props = $props();

    interface Country {
        data: {
            code: string;
            name: string;
            dial_code: string;
            flag: string;
        };
    }

    const country: Country | undefined = $derived(page.data.countries.find((country: Country): boolean => country.data.name === company?.address.country));

    let siret: string = $state(company?.siret ?? '10000000000000');
    let name: string = $state(company?.name ?? '');
    let address: string = $state(company?.address.address ?? '');
    let postalCode: string = $state(company?.address.postalCode ?? '');
    let city: string = $state(company?.address.city ?? '');
    let complement: string = $state(company?.address.complement ?? '');
    let countryCode: string = $derived(company?.address.country ? (country?.data.code ?? 'FR') : 'FR');
    let email: string | undefined = $state(company?.email ?? undefined);
    let phoneNumber: string | undefined = $derived(company?.phoneNumber?.replace(country?.data.dial_code ?? '', '') ?? undefined);
    let logo: File | undefined = $state();

    let phoneValue = $derived(phoneNumber ?? '');

    let showSiretPopover: boolean = $state(false);

    const validation = $derived(
        companyValidator.safeParse({
            siret,
            name,
            address,
            postalCode,
            city,
            complement,
            countryCode,
            email,
            phoneNumber,
            logo,
        })
    );

    const canSubmit = $derived(validation.success);
    let errors: any = $state({ formErrors: [], properties: {} });

    let countriesOptions: SelectItem[] = $state([]);
    let selectedCountry: Country | undefined = $derived(page.data.countries.find((country: Country) => country.data.code === countryCode));

    onMount((): void => {
        if (page.data.isSuccess) {
            countriesOptions = page.data.countries.map(({ data: country }: Country): SelectItem => {
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
        if (errors.properties?.siret?.errors?.[0]) {
            showToast(errors.properties?.siret?.errors?.[0], 'error');
            return;
        }

        await wrappedFetch(`/profile/companies/new/siret/${siret}`, { method: 'GET' }, ({ data }): void => {
            name = formatForCompany(data.periodesEtablissement[0]?.denominationUsuelleEtablissement);
            address = formatForCompany(
                `${data.adresseEtablissement.numeroVoieEtablissement} ${data.adresseEtablissement.typeVoieEtablissement} ${data.adresseEtablissement.libelleVoieEtablissement}`,
                3
            );
            postalCode = data.adresseEtablissement.codePostalEtablissement;
            city = formatForCompany(data.adresseEtablissement.libelleCommuneEtablissement);
            complement = formatForCompany(data.adresseEtablissement.complementAdresseEtablissement);
            const filteredCountry: SelectItem | undefined = countriesOptions.find((country: SelectItem) => country.label.includes('France'));
            if (filteredCountry) {
                countryCode = filteredCountry.value;
            }
        });
    };

    const handleFormSubmitError = (): void => {
        email = undefined;
        phoneNumber = undefined;
    };

    $effect((): void => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
        }
    });
</script>

{#if company && !company.enabled}
    <ConfirmCompanyForm />
{/if}

<AdminForm
    id={company?.id}
    {canSubmit}
    deleteTitle={m['company.delete.title']({ name: company?.name ?? '' })}
    deleteText={m['company.delete.text']({ name: company?.name ?? '' })}
    action={company ? '?/update' : ''}
    onError={handleFormSubmitError}
>
    <div class="flex gap-3">
        <Input
            name="siret"
            placeholder={m['company.fields.siret.placeholder']()}
            label={m['company.fields.siret.label']()}
            bind:value={siret}
            max={14}
            pattern="[0-9]*"
            error={errors.properties?.siret?.errors?.[0]}
            required
        />
        {#if !company}
            <Popover open={showSiretPopover}>
                <Button
                    disabled={errors.properties?.siret?.errors?.[0]}
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
                <PopoverContent>{m['company.fields.siret.popover.content']()}</PopoverContent>
            </Popover>
        {/if}
    </div>
    <Input
        type="text"
        name="name"
        placeholder={m['company.fields.name.placeholder']()}
        label={m['company.fields.name.label']()}
        bind:value={name}
        error={errors.properties?.name?.errors?.[0]}
        required
    />
    <Input
        type="text"
        name="address"
        placeholder={m['company.fields.address.placeholder']()}
        label={m['company.fields.address.label']()}
        bind:value={address}
        error={errors.properties?.address?.errors?.[0]}
        required
    />
    <div class="flex gap-5">
        <Input
            type="text"
            name="postal-code"
            placeholder={m['company.fields.postal-code.placeholder']()}
            label={m['company.fields.postal-code.label']()}
            bind:value={postalCode}
            error={errors.properties?.postalCode?.errors?.[0]}
            required
        />
        <Input
            type="text"
            name="city"
            placeholder={m['company.fields.city.placeholder']()}
            label={m['company.fields.city.label']()}
            bind:value={city}
            error={errors.properties?.city?.errors?.[0]}
            required
        />
    </div>
    <Input
        type="text"
        name="complement"
        placeholder={m['company.fields.complement.placeholder']()}
        label={m['company.fields.complement.label']()}
        bind:value={complement}
        error={errors.properties?.complement?.errors?.[0]}
    />
    <ComboBox
        name="country-code"
        items={countriesOptions}
        placeholder={m['company.fields.country.placeholder']()}
        searchPlaceholder={m['company.fields.country.search-placeholder']()}
        noItemFound={m['company.fields.country.no-item-found']()}
        bind:value={countryCode}
    />
    <div class="flex gap-5 items-start">
        <Input type="email" name="email" placeholder={m['common.email.placeholder']()} label={m['common.email.label']()} bind:value={email} error={errors.properties?.email?.errors?.[0]} />
        <PhoneNumber
            country={selectedCountry}
            name="phone-number"
            placeholder={m['common.phone-number.placeholder']()}
            label={m['common.phone-number.label']()}
            bind:value={phoneValue}
            error={errors.properties?.phoneNumber?.errors?.[0]}
        />
    </div>
    <FileUpload
        name="logo"
        accept="png jpg jpeg webp svg"
        title={m['company.fields.logo.title']()}
        description={m['company.fields.logo.description']()}
        pathPrefix="company-logo"
        id={company?.id || ''}
        fileName={company?.logo?.name}
        bind:file={logo}
        error={errors.properties?.logo?.errors?.[0]}
    />
</AdminForm>
