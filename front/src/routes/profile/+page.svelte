<script lang="ts">
    import Form from '#components/Form.svelte';
    import { Input } from '#lib/components/ui/input';
    import { Link } from '#lib/components/ui/link';
    import { profile } from '#lib/stores/profileStore';
    import { m } from '#lib/paraglide/messages';
    import FileUpload from '#components/FileUpload.svelte';
    import { type SerializedUser } from 'backend/types';
    import * as zod from 'zod';
    import { Button } from '#lib/components/ui/button';
    import { profileValidator } from '#lib/validators/profile';

    let username: string = $state($profile?.username || '');
    let email: string = $state($profile?.email || '');
    let profilePicture: File | undefined = $state();

    let profileData: SerializedUser = $profile!;

    const handleError = (): void => {
        username = profileData.username;
        email = profileData.email;
    };

    const validation = $derived(
        profileValidator.safeParse({
            username,
            email,
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

<Form isValid={canSubmit} onError={handleError}>
    <Input
        name="username"
        placeholder={m['common.username.label']()}
        label={m['common.username.label']()}
        min={3}
        max={50}
        bind:value={username}
        error={errors.properties?.username?.errors?.[0]}
        required
    />
    <div>
        <Input name="email" placeholder={m['common.email.label']()} label={m['common.email.label']()} max={100} bind:value={email} error={errors.properties?.email?.errors?.[0]} readonly required />
        <Link href="/reset-password" class="px-0">
            {m['profile.reset-password']()}
        </Link>
    </div>
    <FileUpload
        name="profilePicture"
        accept="png jpg jpeg gif webp svg"
        fileName={profileData.profilePicture?.name}
        title={m['profile.profile-picture.title']()}
        description={m['profile.profile-picture.description']()}
        pathPrefix="profile-picture"
        id={profileData.id}
        bind:file={profilePicture}
    />
    <Link href="/company/new">
        <Button>
            {m['profile.new-company']()}
        </Button>
    </Link>
</Form>
