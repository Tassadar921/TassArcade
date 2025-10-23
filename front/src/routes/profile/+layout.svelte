<script lang="ts">
    import { type Snippet } from 'svelte';
    import { Button } from '#lib/components/ui/button';
    import Meta from '#components/Meta.svelte';
    import { Title } from '#lib/components/ui/title';
    import { m } from '#lib/paraglide/messages';
    import { Link } from '#lib/components/ui/link/index.js';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();

    let activeTab: 'profile' | 'companies' = $state('profile');
    const tabTranslationPrefix: 'profile' | 'profile.companies' = $derived(activeTab === 'profile' ? 'profile' : 'profile.companies');

    const handleSwitchTab = (tab: 'profile' | 'companies'): void => {
        activeTab = tab;
    };
</script>

<Meta
    title={m[`${tabTranslationPrefix}.meta.title`]()}
    description={m[`${tabTranslationPrefix}.meta.description`]()}
    keywords={m[`${tabTranslationPrefix}.meta.keywords`]().split(', ')}
    pathname="/profile"
/>

<Title title={m[`${tabTranslationPrefix}.title`]()} hasBackground />

<div class="w-full grid grid-cols-2 gap-2 mt-5">
    <Link class="p-0" href="/profile" disabled={activeTab === 'profile'}>
        <Button variant="outline" class="w-full" disabled={activeTab === 'profile'} onclick={() => handleSwitchTab('profile')}>
            {m['profile.title']()}
        </Button>
    </Link>
    <Link class="p-0" href="/profile/companies" disabled={activeTab === 'companies'}>
        <Button variant="outline" class="w-full" disabled={activeTab === 'companies'} onclick={() => handleSwitchTab('companies')}>
            {m['profile.companies.title']()}
        </Button>
    </Link>
</div>

{@render children()}
