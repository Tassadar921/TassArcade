<script lang="ts">
    import type { SerializedLanguage } from 'backend/types';
    import { Input } from '#lib/components/ui/input';
    import { m } from '#lib/paraglide/messages';

    type Props = {
        translations: { languageCode: string; name: string }[];
        languages: SerializedLanguage[];
        errors: any;
    };

    let { translations = $bindable(), languages, errors }: Props = $props();
</script>

<input type="hidden" name="translations" value={JSON.stringify(translations)} />
{#each languages as language}
    {@const translationIndex = translations.findIndex((t) => t.languageCode === language.code)}
    {@const translation = translationIndex >= 0 ? translations[translationIndex] : null}
    {#if translation}
        <div class="flex flex-col gap-2">
            <div class="flex gap-3">
                <img src={`/assets/language-flag/${language.id}`} alt={language.name} class="size-10" />
                <Input
                    name=""
                    label={m['common.name']()}
                    min={3}
                    max={50}
                    bind:value={translation.name}
                    error={errors.properties?.translations?.items?.[translationIndex]?.properties?.name?.errors?.[0]}
                    required
                />
            </div>
        </div>
    {/if}
{/each}
