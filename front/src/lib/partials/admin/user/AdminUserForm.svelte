<script lang="ts">
    import AdminForm from '#lib/partials/AdminForm.svelte';
    import type { SerializedUser } from 'backend/types';
    import { Input } from '#lib/components/ui/input';
    import { m } from '#lib/paraglide/messages';
    import FileUpload from '#components/FileUpload.svelte';
    import { Switch } from '#lib/components/ui/switch';
    import * as zod from 'zod';
    import { adminUserValidator } from '#lib/validators/admin/user';

    type Props = {
        user?: SerializedUser;
    };

    let { user }: Props = $props();

    let email = $state(user?.email || '');
    let username = $state(user?.username || '');
    let enabled = $state(user?.enabled || false);
    let profilePicture: File | undefined = $state();

    const validation = $derived(
        adminUserValidator.safeParse({
            username,
            email,
            enabled,
            profilePicture,
        })
    );

    const canSubmit = $derived(validation.success);
    let errors: any = $state({ formErrors: [], properties: {} });

    $effect(() => {
        if (validation.success) {
            errors = { formErrors: [], properties: {} };
        } else {
            errors = zod.treeifyError(validation.error);
        }
    });
</script>

<AdminForm id={user?.id} {canSubmit} deleteTitle={m['admin.user.delete.title']({ users: [user?.email] })} deleteText={m['admin.user.delete.text']({ users: [user?.email], count: 1 })}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-8">
            <Input name="username" label={m['admin.user.fields.username']()} min={3} max={50} bind:value={username} error={errors.properties?.username?.errors?.[0]} required />
            <Input name="email" label={m['admin.user.fields.email']()} min={3} max={100} bind:value={email} readonly={!!user} error={errors.properties?.email?.errors?.[0]} required />
            <Switch name="enabled" label={m['admin.user.fields.enabled']()} bind:checked={enabled} disabled />
        </div>
        <div>
            <FileUpload
                name="profilePicture"
                accept="png jpg jpeg gif webp svg"
                fileName={user?.profilePicture?.name}
                title={m['admin.user.new.profile-picture.title']()}
                description={m['admin.user.new.profile-picture.description']()}
                pathPrefix="profile-picture"
                id={user?.id || ''}
                bind:file={profilePicture}
            />
        </div>
    </div>
</AdminForm>
