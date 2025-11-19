<script lang="ts">
    import { type Snippet } from 'svelte';
    import { Button } from '#lib/components/ui/button';
    import { m } from '#lib/paraglide/messages';
    import { Link } from '#lib/components/ui/link';
    import { location } from '#lib/stores/locationStore';
    import { language } from '#lib/stores/languageStore';
    import { page } from '$app/state';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();

    const TranslationKeyEnum = {
        MANAGE_ADMINISTRATORS: 'company.edit.administrators',
        MANAGE_EQUIPMENTS: 'company.edit.equipments',
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
        administrators: {
            path: `/profile/companies/edit/${page.params.id}/administrators`,
            translationKey: TranslationKeyEnum.MANAGE_ADMINISTRATORS,
        },
        equipments: {
            path: `/profile/companies/edit/${page.params.id}/equipments`,
            translationKey: TranslationKeyEnum.MANAGE_EQUIPMENTS,
        },
    };

    type TabKey = keyof typeof tabs;

    const displayedTabs = Object.entries(tabs).map(([key, config]) => ({
        key: key as TabKey,
        ...config,
    }));

    let activeTab: TabKey = $state(displayedTabs.find((tab) => $location.replace(`/${$language}`, '') === tab.path)?.key ?? tabs.administrators.path);

    const handleSwitchTab = (tab: TabKey): void => {
        activeTab = tab;
    };

    $effect((): void => {
        activeTab = displayedTabs.find((tab) => $location.replace(`/${$language}`, '') === tab.path)?.key ?? '';
    });
</script>

<div class="w-full grid grid-cols-2 gap-2 mt-5">
    {#each displayedTabs as { key, path, translationKey }}
        <Link class="p-0" href={path} disabled={activeTab === key}>
            <Button variant="secondary" class="w-full" disabled={activeTab === key} onclick={() => handleSwitchTab(key)}>
                {m[`${translationKey}.title`]()}
            </Button>
        </Link>
    {/each}
</div>

{@render children()}
