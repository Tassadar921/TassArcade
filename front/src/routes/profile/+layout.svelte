<script lang="ts">
    import { type Snippet } from 'svelte';
    import { Button } from '#lib/components/ui/button';
    import Meta from '#components/Meta.svelte';
    import { Title } from '#lib/components/ui/title';
    import { m } from '#lib/paraglide/messages';
    import { Link } from '#lib/components/ui/link/index.js';
    import { page } from '$app/state';
    import { Breadcrumb, type Item } from '#lib/components/ui/breadcrumb';
    import { location } from '#lib/stores/locationStore';
    import { language } from '#lib/stores/languageStore';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();

    const TranslationKeyEnum = {
        PROFILE: 'profile',
        PROFILE_COMPANY: 'profile.companies',
        COMPANY_NEW: 'company.new',
    } as const;

    type TranslationKeyEnum = (typeof TranslationKeyEnum)[keyof typeof TranslationKeyEnum];

    interface Tab {
        path: string;
        translationKey: TranslationKeyEnum;
        breadcrumbItems: Item[];
    }

    interface Tabs {
        [key: string]: Tab;
    }

    const tabs: Tabs = {
        profile: {
            path: '/profile',
            translationKey: TranslationKeyEnum.PROFILE,
            breadcrumbItems: [{ title: m['profile.title']() }],
        },
        companies: {
            path: '/profile/companies',
            translationKey: TranslationKeyEnum.PROFILE_COMPANY,
            breadcrumbItems: [{ title: m['profile.title'](), href: '/profile' }, { title: m['profile.companies.title']() }],
        },
        newCompany: {
            path: '/profile/companies/new',
            translationKey: TranslationKeyEnum.COMPANY_NEW,
            breadcrumbItems: [{ title: m['profile.title'](), href: '/profile' }, { title: m['profile.companies.title'](), href: '/profile/companies' }, { title: m['company.new.title']() }],
        },
    };

    type TabKey = keyof typeof tabs;

    const displayedTabs = Object.entries(tabs).map(([key, config]) => ({
        key: key as TabKey,
        ...config,
    }));

    let activeTab: TabKey = $state(displayedTabs.find((tab) => $location.replace(`/${$language}`, '') === tab.path)?.key ?? 'profile');

    const currentConfig = $derived(tabs[activeTab]);
    const tabTranslationPrefix: TranslationKeyEnum = $derived(currentConfig.translationKey);
    const breadcrumbItems: Item[] = $derived(currentConfig.breadcrumbItems);

    const handleSwitchTab = (tab: TabKey): void => {
        activeTab = tab;
    };

    $effect((): void => {
        activeTab = displayedTabs.find((tab) => $location.replace(`/${$language}`, '') === tab.path)?.key ?? 'profile';
    });
</script>

<Meta
    title={m[`${tabTranslationPrefix}.meta.title`]()}
    description={m[`${tabTranslationPrefix}.meta.description`]()}
    keywords={m[`${tabTranslationPrefix}.meta.keywords`]().split(', ')}
    pathname={currentConfig.path}
/>

<Title title={m[`${tabTranslationPrefix}.title`]()} hasBackground />

<Breadcrumb items={breadcrumbItems} />

<div class="w-full grid grid-cols-2 gap-2 mt-5">
    {#each displayedTabs as { key, path, translationKey }}
        {#if key !== 'newCompany'}
            <Link class="p-0" href={path} disabled={activeTab === key}>
                <Button variant="outline" class="w-full" disabled={activeTab === key} onclick={() => handleSwitchTab(key)}>
                    {m[`${translationKey}.title`]()}
                </Button>
            </Link>
        {/if}
    {/each}
</div>

{@render children()}
