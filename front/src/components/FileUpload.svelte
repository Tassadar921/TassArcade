<script lang="ts">
    import { m } from '#lib/paraglide/messages';
    import { raw } from '#lib/services/stringService';
    import Loader from '#components/Loader.svelte';
    import { Upload } from '@lucide/svelte';
    import { onMount } from 'svelte';

    type Props = {
        name: string;
        title?: string;
        description?: string;
        accept: string;
        fileName?: string;
        pathPrefix?: string;
        id?: string;
        disabled?: boolean;
        file?: File;
        error?: string;
    };

    let { name, title = m['common.file.title'](), description = m['common.file.description'](), accept, fileName = '', pathPrefix, id, disabled = false, file = $bindable(), error }: Props = $props();

    let inputRef: HTMLInputElement;
    let acceptedFormats: string = $state(
        accept
            .split(' ')
            .map((format: string) => `.${format}`)
            .join(',')
    );
    let isDragging: boolean = $state(false);
    let isLoading: boolean = false;
    let previewSrc: string = $state('');

    onMount(() => {
        if (fileName && pathPrefix && id && inputRef) {
            const bust = Date.now();
            urlToFile(`/assets/${pathPrefix}/${id}?no-cache=true&_=${bust}`, fileName).then((f) => {
                const dt = new DataTransfer();
                dt.items.add(f);
                inputRef.files = dt.files;
                inputRef.dispatchEvent(new Event('change', { bubbles: true }));
            });
        } else {
            previewSrc = '';
        }
    });

    const handleFileChange = (event: Event): void => {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        if (disabled || !target.files || target.files.length === 0) return;

        file = target.files[0];
        fileName = file.name;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                previewSrc = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        } else {
            previewSrc = '';
        }
    };

    const handleDragOver = (event: DragEvent): void => {
        if (disabled) {
            return;
        }
        event.preventDefault();
        isDragging = true;
    };

    const handleDragLeave = (): void => {
        if (disabled) {
            return;
        }
        isDragging = false;
    };

    const handleDrop = (event: DragEvent): void => {
        if (disabled) {
            return;
        }
        event.preventDefault();
        isDragging = false;

        if (event.dataTransfer?.files?.length) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(event.dataTransfer.files[0]);
            inputRef.files = dataTransfer.files;
            inputRef.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
        if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            inputRef.click();
        }
    };

    const urlToFile = async (url: string, filename: string): Promise<File> => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    };
</script>

<Loader {isLoading} />

<div class="flex flex-col w-full">
    {#if title}
        <div class="flex items-center gap-1 justify-center">
            <h3 class="font-semibold text-center mb-2">{title}</h3>
        </div>
    {/if}

    <button
        type="button"
        class={`flex flex-col items-center justify-center border-2 border-gray-400 dark:border-white rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-gray-800 m-auto p-3 cursor-pointer`}
        class:bg-blue-50={isDragging && !disabled}
        class:border-blue-500={isDragging && !disabled}
        onclick={() => !disabled && inputRef.click()}
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
        onkeydown={handleKeyDown}
        aria-label="File uploader"
        {disabled}
    >
        <input bind:this={inputRef} type="file" class="sr-only" {name} accept={acceptedFormats} onchange={handleFileChange} {disabled} />

        <span class="text-primary-500">
            <Upload class="size-6" />
        </span>

        <span class="text-center text-sm text-gray-500 my-3 w-full">
            {#if fileName}
                {#if previewSrc}
                    <div class="mt-3 flex justify-center">
                        <img src={previewSrc} alt="Preview" class="size-24 object-cover rounded" />
                    </div>
                {:else}
                    <p class="truncate w-full">{fileName}</p>
                {/if}
            {:else}
                {@html raw(description)}
            {/if}
        </span>
    </button>

    {#if error && file}
        <p class="text-red-500 text-sm mt-1">{error}</p>
    {/if}
</div>
