<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import FileUpload from '#components/FileUpload.svelte';
    import { Popover, PopoverContent, PopoverTrigger } from '#lib/components/ui/popover';
    import { Button } from '#lib/components/ui/button';
    import { CircleQuestionMark } from '@lucide/svelte';
    import { confirmCompanyValidator } from '#lib/validators/confirm-company';
    import * as zod from 'zod';

    let showConfirmPopover: boolean = $state(false);
    let document: File | undefined = $state();

    const validation = $derived(
        confirmCompanyValidator.safeParse({
            document,
        })
    );

    const canSubmit: boolean = $derived(validation.success);
    let errors: any = $state({ formErrors: [], properties: {} });

    $effect((): void => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
        }
    });
</script>

<form class="flex flex-col gap-5 p-5 mt-5 w-full rounded-lg shadow-md bg-red-900">
    <p class="whitespace-pre-line">{m['company.edit.confirm.introduction']()}</p>
    <div class="flex flex-col gap-1">
        <FileUpload
            name="confirmCompany"
            accept="png jpg jpeg webp svg pdf"
            title={m['company.edit.confirm.file-upload.title']()}
            description={m['company.edit.confirm.file-upload.description']()}
            bind:file={document}
        />
        <p class="text-center">{errors.properties?.confirmCompany?.errors?.[0]}</p>
    </div>
    <div class="flex gap-3">
        <p class="whitespace-pre-line">{m['company.edit.confirm.rgpd']()}</p>
        <Popover open={showConfirmPopover}>
            <PopoverTrigger
                onmouseenter={() => (showConfirmPopover = true)}
                onfocus={() => (showConfirmPopover = true)}
                onmouseleave={() => (showConfirmPopover = false)}
                onblur={() => (showConfirmPopover = false)}
            >
                <CircleQuestionMark />
            </PopoverTrigger>
            <PopoverContent class="w-96">{m['company.edit.confirm.popover.content']()}</PopoverContent>
        </Popover>
    </div>
    <div class="w-full flex justify-end gap-5 pr-5">
        <Button size="lg" type="submit" variant="secondary" disabled={!canSubmit}>{m['common.confirm']()}</Button>
    </div>
</form>
