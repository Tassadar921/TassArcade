<script lang="ts">
    import type { FormEventHandler, HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
    import { cn, type WithElementRef } from '#lib/utils';
    import { Button } from '#lib/components/ui/button/index';
    import { Eye, EyeOff } from '@lucide/svelte';

    type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

    type Props = WithElementRef<
        Omit<HTMLInputAttributes, 'type'> & {
            type?: InputType | 'file';
            files?: FileList;
            label?: string;
            readonly?: boolean;
            max?: number;
            error?: string;
        }
    >;

    let {
        ref = $bindable(),
        value = $bindable(),
        type = 'text',
        files = $bindable(),
        class: className,
        name,
        placeholder,
        required = false,
        onfocus,
        onblur,
        label,
        readonly = false,
        max,
        pattern,
        error,
        ...restProps
    }: Props = $props();

    let showPassword = $state(false);
    let isFocused = $state(false);
    let touched = $state(false);

    const isPassword: boolean = $derived(type === 'password');
    const actualType: InputType = $derived(isPassword ? (showPassword ? 'text' : 'password') : type);

    const togglePasswordVisibility = () => {
        showPassword = !showPassword;
    };

    const handleFocus = (event: FocusEvent) => {
        isFocused = true;
        onfocus?.(event as FocusEvent & { currentTarget: EventTarget & HTMLInputElement });
    };

    const handleBlur = (event: FocusEvent) => {
        isFocused = false;
        touched = true;
        onblur?.(event as FocusEvent & { currentTarget: EventTarget & HTMLInputElement });
    };

    const handleInput: FormEventHandler<HTMLInputElement> = (event) => {
        if (!pattern) return;
        const input = event.currentTarget as HTMLInputElement;
        try {
            const regex = new RegExp(`^${pattern}$`);
            if (!regex.test(input.value)) {
                input.value = input.value
                    .split('')
                    .filter((char) => regex.test(char) || new RegExp(pattern).test(char))
                    .join('');
            }
            value = input.value;
        } catch (err) {
            console.warn('Invalid pattern regex:', pattern, err);
        }
    };

    $effect(() => {
        if (max && typeof value === 'string' && value.length > max) {
            value = value.slice(0, max);
        }
    });
</script>

<div class="w-full">
    <div class="relative">
        {#if type === 'file'}
            <input
                bind:this={ref}
                type="file"
                data-slot="input"
                class={cn(
                    'selection:bg-primary dark:bg-input/30 selection:text-primary-foreground border-input ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 pt-1.5 text-sm font-medium outline-none transition-[color,box-shadow]',
                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    'disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-not-allowed read-only:opacity-50',
                    className
                )}
                {name}
                bind:files
                bind:value
                {readonly}
                {...restProps}
            />
        {:else}
            <label
                for={name}
                class="absolute pointer-events-none z-10 transition-all duration-800 ease-in-out font-medium {isFocused || (value !== undefined && value !== null && value !== '')
                    ? 'bottom-9 left-1'
                    : 'text-gray-600 dark:text-gray-400 bottom-1.5 left-3'}"
            >
                {label}
                {#if required}
                    <span class="text-red-600 font-medium">*</span>
                {/if}
            </label>
            <input
                bind:this={ref}
                type={actualType}
                data-slot="input"
                placeholder={isFocused ? placeholder : ''}
                onfocus={handleFocus}
                onblur={handleBlur}
                oninput={handleInput}
                class={cn(
                    'border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow]',
                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    'disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-not-allowed read-only:opacity-50',
                    isPassword ? 'pr-10' : '',
                    error && touched ? 'border-red-500 focus-visible:ring-red-500' : '',
                    className
                )}
                {name}
                bind:value
                {readonly}
                {pattern}
                {...restProps}
            />

            {#if isPassword}
                <Button type="button" onclick={togglePasswordVisibility} aria-label="Toggle password visibility" variant="ghost" size="icon" class="absolute -top-0.5 right-0 rounded-full">
                    {#if showPassword}
                        <EyeOff class="size-6" />
                    {:else}
                        <Eye class="size-6" />
                    {/if}
                </Button>
            {/if}
        {/if}
    </div>

    {#if error && touched}
        <p class="text-red-500 text-sm mt-1">{error}</p>
    {/if}
</div>
