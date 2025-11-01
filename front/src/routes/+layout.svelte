<script lang="ts">
    import '../app.css';
    import Menu from '#lib/partials/menu/Menu.svelte';
    import { onMount } from 'svelte';
    import Meta from '#components/Meta.svelte';
    import { m } from '#lib/paraglide/messages';
    import { getFlash } from 'sveltekit-flash-message/client';
    import { page } from '$app/state';
    import { showToast } from '#lib/services/toastService';
    import { Footer } from '#lib/components/ui/footer';
    import { Transmit } from '@adonisjs/transmit-client';
    import { transmit } from '#lib/stores/transmitStore';
    import { PUBLIC_API_REAL_URI } from '$env/static/public';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
    const flash = getFlash(page);

    onMount((): void => {
        transmit.set(new Transmit({ baseUrl: PUBLIC_API_REAL_URI }));
    });

    $effect((): void => {
        if ($flash) {
            showToast($flash.message, $flash.type);
        }
    });
</script>

<Meta title={m['home.meta.title']()} description={m['home.meta.description']()} keywords={m['home.meta.keywords']().split(', ')} />

<div class="app">
    <main class="flex flex-col w-screen">
        <Menu>
            <div class:min-h-screen={!page.data.isAdmin} class="px-3.5">
                {@render children()}
            </div>

            {#if !page.data.isAdmin}
                <Footer />
            {/if}
        </Menu>
    </main>
</div>
