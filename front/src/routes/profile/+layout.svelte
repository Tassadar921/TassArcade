<script lang="ts">
    import { type Snippet } from 'svelte';
    import { Button } from '#lib/components/ui/button';
    import { m } from '#lib/paraglide/messages';
    import { Link } from '#lib/components/ui/link';
    import { location } from '#lib/stores/locationStore';
    import { language } from '#lib/stores/languageStore';
    import { Breadcrumb } from '#lib/components/ui/breadcrumb';
    import { Title } from '#lib/components/ui/title';
    import Meta from '#components/Meta.svelte';
    import { page } from '$app/state';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();

    const TranslationKeyEnum = {
        PROFILE: 'profile',
        PROFILE_COMPANY: 'profile.companies',
    } as const;

    type TranslationKeyEnum = (typeof TranslationKeyEnum)[keyof typeof TranslationKeyEnum];

    interface Tab {
        path: string;
        translationKey: TranslationKeyEnum;
    }

    interface Tabs {
        [key: string]: Tab;
    }

    const tabs: Tabs = {
        profile: {
            path: '/profile',
            translationKey: TranslationKeyEnum.PROFILE,
        },
        companies: {
            path: '/profile/companies',
            translationKey: TranslationKeyEnum.PROFILE_COMPANY,
        },
    };

    type TabKey = keyof typeof tabs;

    const displayedTabs = Object.entries(tabs).map(([key, config]) => ({
        key: key as TabKey,
        ...config,
    }));

    let activeTab: TabKey = $state(displayedTabs.find((tab) => $location.replace(`/${$language}`, '') === tab.path)?.key ?? 'profile');

    const handleSwitchTab = (tab: TabKey): void => {
        activeTab = tab;
    };

    $effect((): void => {
        activeTab = displayedTabs.find((tab) => $location.replace(`/${$language}`, '') === tab.path)?.key ?? '';
    });
</script>

<Meta title={page.data.meta.title} description={page.data.meta.description} pathname={page.data.meta.pathname} />

<Title title={page.data.title} hasBackground />

<Breadcrumb items={page.data.breadcrumb} />

<div class="w-full grid grid-cols-2 gap-2 mt-5">
    {#each displayedTabs as { key, path, translationKey }}
        <Link class="p-0" href={path} disabled={activeTab === key}>
            <Button variant="outline" class="w-full" disabled={activeTab === key} onclick={() => handleSwitchTab(key)}>
                {m[`${translationKey}.title`]()}
            </Button>
        </Link>
    {/each}
</div>

{@render children()}
